# Backend IA

La aplicación y el backend se sirven desde el mismo origen. La API expone `POST /api/v1/plans/generate` y `GET /health`. El generador usa un endpoint de chat completions compatible con OpenAI; las credenciales solo se leen desde el entorno del servidor.

1. Copia `.env.example` a `.env` y configura una API key, la URL base y el identificador del modelo de tu proveedor.
2. Construye y ejecuta la aplicación local:

```powershell
docker build -t proyecto-claro-api .
docker run --rm --env-file .env -p 127.0.0.1:8000:8000 proyecto-claro-api
```

La comprobacion de salud esta disponible en `http://localhost:8000/health`. Para ejecutar las pruebas aisladas del proveedor:

```powershell
docker build --target test -t proyecto-claro-api-test .
docker run --rm proyecto-claro-api-test
```

El endpoint valida que el modelo devuelva las cuatro fases PHVA en orden. No verifica leyes, cotizaciones ni certificaciones; esos contenidos deben validarse con fuentes y profesionales competentes.