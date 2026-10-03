---
title: record.load vs submitFields y search.create vs lookupFields
description: Aprende cuándo usar record.load o submitFields, y search.create o lookupFields en SuiteScript, con ejemplos reales y tips para User Events.
date: 3 de Octubre, 2026
author: Angel Marcos
minutes: 7
tags: [NetSuite, SuiteScript, JavaScript]
stack: NetSuite
---

Cuando empecé con SuiteScript, casi todo lo resolvía igual: `record.load`, cambiar lo que necesitaba, `save`. Y cuando necesitaba un dato, `search.create`. Funcionaba, pero con el tiempo entendí que muchos scripts lentos tenían el mismo origen: usar una herramienta más grande de lo necesario.

En este post te cuento cómo decido yo entre estas dos parejas de opciones y qué tips básicos aplico en los User Events.

---

## 1. `record.load` vs `record.submitFields`

### La idea básica

- `record.load` **abre el registro completo**: body, sublistas, todo. Lo modificas en memoria y luego haces `save`.
- `record.submitFields` **solo actualiza los campos que le indicas**, sin abrir el registro completo.

Si solo quieres cambiar un campo, no necesitas abrir todo el registro.

### Cuándo usar cada uno

| Situación                                                                      | Uso             |
| ------------------------------------------------------------------------------ | --------------- |
| Cambiar uno o varios campos del body (checkbox, fecha, texto, estado custom)   | `submitFields`  |
| Actualizar un campo desde un Map/Reduce o Scheduled Script en muchos registros | `submitFields`  |
| Agregar, quitar o editar líneas de una sublista                                | `load` + `save` |
| El cambio depende de otros valores del registro                                | `load` + `save` |
| Necesito recalcular o validar el registro completo antes de guardar            | `load` + `save` |

### Ejemplo con `record.load` (cuando NO es necesario)

```javascript
const inv = record.load({
  type: record.Type.INVOICE,
  id: invoiceId
})
inv.setValue({ fieldId: 'custbody_email_enviado', value: true })
inv.setValue({ fieldId: 'custbody_fecha_envio', value: new Date() })
inv.save()
```

Cargo toda la factura, con todas sus líneas, solo para cambiar dos campos.

### Ejemplo con `submitFields` (la mejor opción aquí)

```javascript
record.submitFields({
  type: record.Type.INVOICE,
  id: invoiceId,
  values: {
    custbody_email_enviado: true,
    custbody_fecha_envio: new Date()
  },
  options: {
    enableSourcing: false,
    ignoreMandatoryFields: true
  }
})
```

Mismo resultado, menos trabajo para NetSuite y menos código.

Sobre las opciones:

- `enableSourcing: false`: evita que NetSuite vuelva a disparar el sourcing de otros campos.
- `ignoreMandatoryFields: true`: permite guardar aunque haya campos obligatorios vacíos. Lo uso con criterio, no por defecto.

### Ejemplo donde SÍ necesito `load` + `save`

Aquí hay que tocar líneas, así que `submitFields` no sirve:

```javascript
const so = record.load({
  type: record.Type.SALES_ORDER,
  id: soId
})

const lineas = so.getLineCount({ sublistId: 'item' })

for (let i = 0; i < lineas; i++) {
  const rate = so.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i })
  so.setSublistValue({
    sublistId: 'item',
    fieldId: 'rate',
    line: i,
    value: rate * 0.9
  })
}

so.save()
```

### Cosas a tener en cuenta con `submitFields`

1. **No funciona con sublistas.** Para líneas, usa `load`.
2. **Dispara los User Events con contexto `xedit`.** En ese caso el `newRecord` trae solo los campos que cambiaste, no todos.
3. **No todos los campos se pueden editar con `submitFields`.** Algunos no son _inline editable_ y fallan. Ante la duda, pruébalo en sandbox.

---

## 2. `search.lookupFields` vs `search.create`

### La idea básica

- `search.lookupFields` **lee campos de UN registro del que ya conoces el ID**. Es directo y liviano.
- `search.create` **busca registros con filtros** y devuelve uno o muchos resultados.

### Cuándo usar cada uno

| Situación                                                                           | Uso                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| Tengo el ID y necesito pocos campos                                                 | `lookupFields`                       |
| Necesito datos de un registro relacionado (ej. email del cliente desde una factura) | `lookupFields` con notación de punto |
| No conozco el ID y tengo que filtrar                                                | `search.create`                      |
| Necesito varios registros                                                           | `search.create`                      |
| Necesito las líneas de una transacción                                              | `search.create`                      |
| Necesito leer sublistas completas                                                   | `record.load`                        |

### Ejemplo con `lookupFields`

```javascript
const datos = search.lookupFields({
  type: search.Type.CUSTOMER,
  id: customerId,
  columns: ['email', 'companyname', 'terms']
})

// Los campos tipo select devuelven un ARRAY de { value, text }
const terminoId = datos.terms[0]?.value
const terminoTexto = datos.terms[0]?.text
```

Con notación de punto puedo traer datos de registros relacionados sin hacer una segunda llamada:

```javascript
const info = search.lookupFields({
  type: search.Type.INVOICE,
  id: invoiceId,
  columns: ['entity.email', 'entity.companyname', 'subsidiary.name']
})
```

### Ejemplo con `search.create`

```javascript
const resultados = []

search
  .create({
    type: search.Type.INVOICE,
    filters: [
      ['mainline', 'is', 'T'],
      'AND',
      ['entity', 'anyof', customerId],
      'AND',
      ['status', 'anyof', 'CustInvc:A']
    ],
    columns: ['tranid', 'trandate', 'amountremaining']
  })
  .run()
  .each((r) => {
    resultados.push({
      id: r.id,
      numero: r.getValue('tranid'),
      pendiente: r.getValue('amountremaining')
    })
    return true // seguir iterando
  })
```

### Tip: evita buscar dentro de un loop

```javascript
// ❌ Una consulta por cada línea
for (let i = 0; i < lineCount; i++) {
  const itemId = rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i })
  const res = search.lookupFields({
    type: search.Type.ITEM,
    id: itemId,
    columns: ['custitem_categoria']
  })
}
```

Lo que hago es **juntar los IDs, hacer una sola búsqueda y guardar el resultado en un `Map`**:

```javascript
// ✅ Una sola búsqueda
const obtenerCategoriasPorItem = (itemIds) => {
  const mapa = new Map()
  const idsUnicos = [...new Set(itemIds)]

  search
    .create({
      type: search.Type.ITEM,
      filters: [['internalid', 'anyof', idsUnicos]],
      columns: ['custitem_categoria']
    })
    .run()
    .each((r) => {
      mapa.set(String(r.id), r.getValue('custitem_categoria'))
      return true
    })

  return mapa
}
```

El patrón es siempre el mismo: recolectar IDs, una búsqueda con `anyof`, y luego usar el mapa.

---

## 3. User Events: tips básicos

Un User Event se ejecuta **mientras el usuario espera**. Si pones mucho trabajo ahí, cada segundo se nota al presionar _Guardar_ o al abrir el formulario.

### Lo ideal en un User Event

- Cálculos pequeños y rápidos.
- Validaciones simples que deben bloquear el guardado.
- Asignar valores por defecto.
- Un `lookupFields` puntual si de verdad lo necesito.

### Lo que evitaría en un User Event

- Búsquedas grandes o varias búsquedas.
- Cargar varios registros con `record.load`.
- Procesos con muchas operaciones encadenadas.
- Lógica pesada en `beforeLoad` (carga del formulario).
- Llamadas a sistemas externos (APIs, integraciones).
- Envío masivo de correos.

### Qué hacer cuando el proceso es pesado

Si no necesita ocurrir justo al guardar, lo saco del User Event y lo delego:

- **Map/Reduce**: mi opción favorita para procesos con muchos registros o muchas operaciones.
- **Scheduled Script**: para procesos más simples o por horario.
- **Campo de estado como "cola"**: el User Event solo marca el registro como pendiente y un Map/Reduce programado lo procesa después.

```javascript
// User Event: solo marca, no procesa
const afterSubmit = (context) => {
  if (context.type !== context.UserEventType.CREATE) return

  record.submitFields({
    type: context.newRecord.type,
    id: context.newRecord.id,
    values: { custbody_pendiente_proceso: true },
    options: { enableSourcing: false, ignoreMandatoryFields: true }
  })
}
```

### Maneja siempre el contexto `xedit`

Cuando alguien actualiza con `submitFields` o edita en línea desde una lista, el User Event corre con contexto `xedit` y el `newRecord` solo trae los campos modificados:

```javascript
const afterSubmit = (context) => {
  if (context.type === context.UserEventType.XEDIT) {
    // Solo vienen los campos modificados.
    // Si necesito otros datos, uso lookupFields.
    return
  }

  // Lógica normal para create / edit
}
```

### Otros tips rápidos

- Ejecuta la lógica solo en los contextos que necesitas (`CREATE`, `EDIT`, etc.), no en todos.
- Sal temprano (`return`) cuando la condición no aplica.
- Evita guardar el mismo registro dentro de su propio User Event: puede generar ciclos.
- Si el trabajo puede esperar, que espere.

---

## 4. Checklist antes de entregar un script

1. ¿Estoy usando `record.load` solo porque necesito sublistas o el registro completo?
2. ¿Puedo reemplazarlo por `submitFields`?
3. ¿Estoy usando `search.create` para algo que `lookupFields` resuelve?
4. ¿Hay alguna búsqueda o lookup dentro de un loop?
5. ¿Mi User Event hace solo lo mínimo, o debería delegar a un Map/Reduce?
6. ¿Mi User Event maneja el contexto `xedit`?

---

## Cierre

Casi nunca se trata de escribir código más complicado, sino de **elegir la herramienta justa**:

- Un solo campo → `submitFields`.
- Sublistas o lógica compleja → `load` + `save`.
- Un registro y pocos datos → `lookupFields`.
- Varios registros o filtros → `search.create`.
- Proceso pesado → fuera del User Event, en un Map/Reduce.
