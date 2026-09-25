import json
import os
from unittest import IsolatedAsyncioTestCase
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient

from server.main import app


PROJECT_INPUT = {
    "project_name": "Adecuacion de biblioteca",
    "sector": "Educacion",
    "location": "Bogota",
    "estimated_budget_cop": 25000000,
    "estimated_duration_weeks": 12,
    "objective": "Adecuar espacios de lectura.",
}

VALID_PLAN = {
    "overview": "Borrador sujeto a validacion del equipo.",
    "phases": [
        {"phase": "Planear", "objective": "Definir alcance.", "activities": ["Acordar entregables."]},
        {"phase": "Hacer", "objective": "Ejecutar actividades.", "activities": ["Adecuar el espacio."]},
        {"phase": "Verificar", "objective": "Revisar resultados.", "activities": ["Comparar avances."]},
        {"phase": "Actuar", "objective": "Aplicar mejoras.", "activities": ["Documentar ajustes."]},
    ],
}

SECOP_RESULT = [{
    "nombre_entidad": "Alcaldia de prueba",
    "departamento": "Cundinamarca",
    "ciudad": "Bogota",
    "descripcion_del_proceso": "Suministro de materiales de construccion",
    "tipo_de_contrato": "Suministros",
    "fecha_de_firma": "2025-02-10T00:00:00.000",
    "valor_del_contrato": "19000000.000000",
    "id_contrato": "CO1.PCCNTR.TEST",
    "referencia_del_contrato": "TEST-2025",
    "urlproceso": {"url": "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=TEST"},
    "proveedor_adjudicado": "Dato personal que no debe mostrarse",
}]


class FakeResponse:
    def __init__(self, content: str):
        self.content = content

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict[str, list[dict[str, dict[str, str]]]]:
        return {"choices": [{"message": {"content": self.content}}]}


class FakeAsyncClient:
    def __init__(self, response: FakeResponse, **kwargs: object):
        self.response = response
        self.request_url = ""
        self.request_headers: dict[str, str] = {}
        self.request_params: dict[str, str] = {}

    async def __aenter__(self) -> "FakeAsyncClient":
        return self

    async def __aexit__(self, *_args: object) -> None:
        return None

    async def post(self, url: str, *, headers: dict[str, str], json: dict[str, object]) -> FakeResponse:
        self.request_url = url
        self.request_headers = headers
        return self.response

    async def get(self, url: str, *, params: dict[str, str]) -> FakeResponse:
        self.request_url = url
        self.request_params = params
        return self.response


class GeneratePlanTests(IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.client = AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver")

    async def asyncTearDown(self) -> None:
        await self.client.aclose()

    async def test_health_does_not_expose_provider_secret(self) -> None:
        with patch.dict(os.environ, {"LLM_API_KEY": "test-secret", "LLM_MODEL": "test-model"}):
            response = await self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "provider_configured": True})
        self.assertNotIn("test-secret", response.text)

    async def test_serves_only_public_frontend_files(self) -> None:
        index_response = await self.client.get("/")
        styles_response = await self.client.get("/styles.css")
        script_response = await self.client.get("/app.js")
        env_response = await self.client.get("/.env")

        self.assertEqual(index_response.status_code, 200)
        self.assertIn("Generar con IA", index_response.text)
        self.assertEqual(styles_response.status_code, 200)
        self.assertEqual(script_response.status_code, 200)
        self.assertEqual(env_response.status_code, 404)

    async def test_generation_requires_server_side_credentials(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            response = await self.client.post("/api/v1/plans/generate", json=PROJECT_INPUT)

        self.assertEqual(response.status_code, 503)
        self.assertIn("LLM_API_KEY", response.json()["detail"])

    async def test_generation_returns_valid_phva_plan(self) -> None:
        fake_client = FakeAsyncClient(FakeResponse(json.dumps(VALID_PLAN)))
        with (
            patch.dict(os.environ, {
                "LLM_API_KEY": "test-secret",
                "LLM_MODEL": "test-model",
                "LLM_BASE_URL": "https://provider.example/v1",
            }),
            patch("server.main.httpx.AsyncClient", return_value=fake_client),
        ):
            response = await self.client.post("/api/v1/plans/generate", json=PROJECT_INPUT)

        self.assertEqual(response.status_code, 200)
        self.assertEqual([phase["phase"] for phase in response.json()["phases"]], ["Planear", "Hacer", "Verificar", "Actuar"])
        self.assertEqual(fake_client.request_url, "https://provider.example/v1/chat/completions")
        self.assertEqual(fake_client.request_headers["Authorization"], "Bearer test-secret")

    async def test_generation_rejects_invalid_provider_output(self) -> None:
        invalid_plan = {**VALID_PLAN, "phases": list(reversed(VALID_PLAN["phases"]))}
        fake_client = FakeAsyncClient(FakeResponse(json.dumps(invalid_plan)))
        with (
            patch.dict(os.environ, {"LLM_API_KEY": "test-secret", "LLM_MODEL": "test-model"}),
            patch("server.main.httpx.AsyncClient", return_value=fake_client),
        ):
            response = await self.client.post("/api/v1/plans/generate", json=PROJECT_INPUT)

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["detail"], "El proveedor devolvio un plan con formato no valido.")

    async def test_blank_project_name_is_rejected(self) -> None:
        response = await self.client.post("/api/v1/plans/generate", json={**PROJECT_INPUT, "project_name": "   "})

        self.assertEqual(response.status_code, 422)

    async def test_secop_search_returns_contract_amount_as_contract_reference(self) -> None:
        class FakeSecopResponse:
            def raise_for_status(self) -> None:
                return None

            def json(self) -> list[dict[str, object]]:
                return SECOP_RESULT

        fake_client = FakeAsyncClient(FakeSecopResponse())
        with patch("server.main.httpx.AsyncClient", return_value=fake_client):
            response = await self.client.post("/api/v1/market/contract-references", json={
                "query": "materiales de construccion",
                "department": "Cundinamarca",
                "limit": 5,
            })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(fake_client.request_url, "https://www.datos.gov.co/resource/jbjy-vk9h.json")
        self.assertEqual(fake_client.request_params["$limit"], "5")
        self.assertEqual(fake_client.request_params["$where"], "upper(departamento) = 'CUNDINAMARCA'")
        self.assertEqual(response.json()[0]["contract_amount_cop"], "19000000.000000")
        self.assertEqual(response.json()[0]["source_url"], SECOP_RESULT[0]["urlproceso"]["url"])
        self.assertNotIn("proveedor_adjudicado", response.json()[0])

    async def test_secop_search_rejects_short_query(self) -> None:
        response = await self.client.post("/api/v1/market/contract-references", json={"query": "ab"})

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()