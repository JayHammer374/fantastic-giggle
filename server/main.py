import json
import os
from pathlib import Path
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator


PHVA_PHASES = ("Planear", "Hacer", "Verificar", "Actuar")
DEFAULT_BASE_URL = "https://openrouter.ai/api/v1"


class ProjectRequest(BaseModel):
    project_name: str = Field(min_length=1, max_length=120)
    sector: str = Field(min_length=1, max_length=100)
    location: str = Field(default="", max_length=120)
    estimated_budget_cop: int | None = Field(default=None, ge=0)
    estimated_duration_weeks: int | None = Field(default=None, ge=1)
    objective: str = Field(default="", max_length=2000)

    @field_validator("project_name", "sector")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Este campo no puede estar vacio")
        return cleaned


class PhasePlan(BaseModel):
    phase: Literal["Planear", "Hacer", "Verificar", "Actuar"]
    objective: str = Field(min_length=1, max_length=600)
    activities: list[str] = Field(min_length=1, max_length=8)


class PlanDraft(BaseModel):
    overview: str = Field(min_length=1, max_length=1200)
    phases: list[PhasePlan] = Field(min_length=4, max_length=4)

    @model_validator(mode="after")
    def phases_must_follow_phva_order(self) -> "PlanDraft":
        phase_names = tuple(phase.phase for phase in self.phases)
        if phase_names != PHVA_PHASES:
            raise ValueError("Las fases deben seguir el orden PHVA")
        return self


app = FastAPI(title="Proyecto Claro API", version="0.1.0")
PUBLIC_FILES = Path(__file__).resolve().parent.parent


@app.get("/", include_in_schema=False)
async def serve_index() -> FileResponse:
    return FileResponse(PUBLIC_FILES / "index.html")


@app.get("/styles.css", include_in_schema=False)
async def serve_styles() -> FileResponse:
    return FileResponse(PUBLIC_FILES / "styles.css")


@app.get("/app.js", include_in_schema=False)
async def serve_script() -> FileResponse:
    return FileResponse(PUBLIC_FILES / "app.js")


def build_messages(project: ProjectRequest) -> list[dict[str, str]]:
    system_message = (
        "Eres un asistente de planeacion de proyectos. Redacta un borrador accionable "
        "en espanol para Colombia. Devuelve unicamente un objeto JSON con las claves "
        "overview y phases. Incluye exactamente cuatro fases en orden: Planear, Hacer, "
        "Verificar y Actuar. Cada fase incluye phase, objective y activities (lista de "
        "tareas concretas). No inventes precios, leyes, permisos ni clausulas ISO. "
        "Cuando falten datos, indica que deben verificarse con una fuente o profesional competente."
    )
    project_data = project.model_dump(mode="json")
    return [
        {"role": "system", "content": system_message},
        {"role": "user", "content": json.dumps(project_data, ensure_ascii=False)},
    ]


async def request_plan_from_provider(project: ProjectRequest) -> PlanDraft:
    api_key = os.getenv("LLM_API_KEY", "").strip()
    model = os.getenv("LLM_MODEL", "").strip()
    if not api_key or not model:
        raise HTTPException(
            status_code=503,
            detail="Configura LLM_API_KEY y LLM_MODEL en el entorno del backend.",
        )

    base_url = os.getenv("LLM_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
    try:
        timeout = float(os.getenv("LLM_TIMEOUT_SECONDS", "45"))
        if timeout <= 0:
            raise ValueError
    except ValueError as error:
        raise HTTPException(status_code=500, detail="LLM_TIMEOUT_SECONDS debe ser mayor que cero.") from error

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                    "messages": build_messages(project),
                },
            )
            response.raise_for_status()
    except httpx.TimeoutException as error:
        raise HTTPException(status_code=504, detail="El proveedor de IA excedio el tiempo de espera.") from error
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 429:
            raise HTTPException(status_code=503, detail="El proveedor de IA tiene limite de solicitudes.") from error
        raise HTTPException(status_code=502, detail="El proveedor de IA rechazo la solicitud.") from error
    except httpx.RequestError as error:
        raise HTTPException(status_code=502, detail="No fue posible conectar con el proveedor de IA.") from error

    try:
        content = response.json()["choices"][0]["message"]["content"]
        return PlanDraft.model_validate_json(content)
    except (KeyError, IndexError, TypeError, ValueError, ValidationError) as error:
        raise HTTPException(status_code=502, detail="El proveedor devolvio un plan con formato no valido.") from error


@app.get("/health")
async def health() -> dict[str, bool | str]:
    configured = bool(os.getenv("LLM_API_KEY", "").strip() and os.getenv("LLM_MODEL", "").strip())
    return {"status": "ok", "provider_configured": configured}


@app.post("/api/v1/plans/generate", response_model=PlanDraft)
async def generate_plan(project: ProjectRequest) -> PlanDraft:
    return await request_plan_from_provider(project)