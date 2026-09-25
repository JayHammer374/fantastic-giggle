# Catalogo de cotizaciones COP

El cotizador importa y exporta JSON con `schemaVersion: 1` y `currency: "COP"`. Para importar, cada partida requiere descripcion, unidad admitida, cantidad, precio unitario, desperdicio, proveedor, URL HTTP(S) y fecha real de cotizacion (`AAAA-MM-DD`). El archivo admite hasta 100 partidas y 1 MB.

La aplicacion no consulta ni certifica precios de mercado. Registra solo cotizaciones que hayas obtenido y verifica que la fuente, vigencia, unidad y cobertura geografica sean aplicables al proyecto.

```json
{
  "schemaVersion": 1,
  "currency": "COP",
  "items": [
    {
      "description": "",
      "unit": "Unidad",
      "quantity": 0,
      "unitCostCop": 0,
      "wastePercent": 0,
      "source": "",
      "sourceUrl": "",
      "quoteDate": ""
    }
  ]
}
```