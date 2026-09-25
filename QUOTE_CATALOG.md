# Catalogo de cotizaciones COP

El cotizador importa y exporta JSON con `schemaVersion: 1` y `currency: "COP"`. Para importar, cada partida requiere descripcion, unidad admitida, cantidad, precio unitario, desperdicio, proveedor, URL HTTP(S) y fecha real de cotizacion (`AAAA-MM-DD`). El archivo admite hasta 100 partidas y 1 MB.

La aplicacion no consulta ni certifica precios de mercado. Registra solo cotizaciones que hayas obtenido y verifica que la fuente, vigencia, unidad y cobertura geografica sean aplicables al proyecto.

## Referencias contractuales SECOP II

El panel tambien consulta `POST /api/v1/market/contract-references`, que usa el conjunto publico de contratos electronicos SECOP II de datos.gov.co. Admite `query`, `department` opcional y un limite de hasta 20 resultados. Devuelve entidad, departamento, ciudad, descripcion, tipo, fecha, identificadores, valor total y enlace al proceso publico.

El valor de SECOP corresponde al contrato completo; no es un precio unitario ni debe copiarse como precio de material. Compara alcance, cantidades, fecha y territorio antes de usarlo como referencia.

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