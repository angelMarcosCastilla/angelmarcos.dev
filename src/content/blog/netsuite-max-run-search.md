---
title: NetSuite Search, el límite de 4,000 resultados y cómo paginar correctamente
description: Aprende cómo manejar búsquedas de NetSuite que superan los 4,000 resultados, cuándo utilizar runPaged y por qué un ordenamiento determinístico es fundamental para procesar grandes volúmenes de datos.
date: 18 de septiembre, 2026
author: Angel Marcos
minutes: 7
tags: [NetSuite, SuiteScript, JavaScript]
stack: NetSuite
---

Cuando empiezas a trabajar con NetSuite y haces búsquedas con `N/search`, probablemente al principio todo parece bastante sencillo.

Creas una búsqueda:

```javascript
const transactionSearch = search.create({
  type: search.Type.TRANSACTION,
  filters: [['mainline', 'is', 'T']],
  columns: ['internalid', 'tranid', 'trandate']
})
```

Y recorres los resultados:

```javascript
transactionSearch.run().each(function (result) {
  const internalId = result.getValue({
    name: 'internalid'
  })

  // Procesar resultado

  return true
})
```

Funciona perfectamente.

Hasta que la cantidad de registros empieza a crecer.

Ahí aparece uno de esos problemas que no siempre se detectan durante el desarrollo: **una búsqueda puede tener miles de resultados, pero `run().each()` no está diseñada para recorrerlos todos.**

## El problema con `run().each()`

El `ResultSet` obtenido mediante `search.run()` tiene un límite de **4,000 resultados**.

Por ejemplo, imaginemos que tenemos:

```text
35,000 transacciones
```

pero hacemos:

```javascript
transactionSearch.run().each(function (result) {
  // ...
  return true
})
```

No deberíamos asumir que estamos recorriendo las 35,000.

El modelo sería:

```text
35,000 resultados
       ↓
search.run()
       ↓
ResultSet
       ↓
run().each()
       ↓
máximo 4,000 resultados
```

Esto puede ser especialmente peligroso porque durante desarrollo quizá tenemos:

```text
500 registros
```

y todo funciona.

Pero en producción el cliente puede tener:

```text
50,000 registros
```

y recién entonces descubrimos el problema.

## Una primera alternativa: `getRange()`

Una opción que normalmente aparece es `getRange()`:

```javascript
const resultSet = transactionSearch.run()

const results = resultSet.getRange({
  start: 0,
  end: 1000
})
```

Podríamos intentar hacer:

```javascript
resultSet.getRange({
  start: 0,
  end: 1000
})

resultSet.getRange({
  start: 1000,
  end: 2000
})

resultSet.getRange({
  start: 2000,
  end: 3000
})
```

Pero aquí hay que tener cuidado.

`getRange()` trabaja sobre el `ResultSet` obtenido mediante `run()`, por lo que **no es una solución para eliminar el límite de 4,000 resultados**.

Si realmente necesitamos procesar más de 4,000 resultados, debemos utilizar paginación.

## La solución: `runPaged()`

Para grandes volúmenes podemos utilizar:

```javascript
const pagedData = transactionSearch.runPaged({
  pageSize: 1000
})
```

Ahora NetSuite divide los resultados en páginas.

Por ejemplo:

```text
25,000 resultados

Página 1  → 1,000
Página 2  → 1,000
Página 3  → 1,000
...
Página 25 → 1,000
```

Podemos recorrerlas de esta manera:

```javascript
const pagedData = transactionSearch.runPaged({
  pageSize: 1000
})

pagedData.pageRanges.forEach(function (pageRange) {
  const page = pagedData.fetch({
    index: pageRange.index
  })

  page.data.forEach(function (result) {
    const internalId = result.getValue({
      name: 'internalid'
    })

    // Procesar resultado
  })
})
```

También podemos conocer previamente cuántos resultados tenemos:

```javascript
log.audit({
  title: 'Total de resultados',
  details: pagedData.count
})
```

Esto nos permite trabajar con búsquedas que superan ampliamente los 4,000 resultados.

## Un detalle importante: el ordenamiento

Aquí viene una parte que considero incluso más importante que conocer `runPaged()`.

Cuando utilizamos paginación, **el orden de los resultados importa**.

No conviene hacer una búsqueda paginada sin un ordenamiento determinístico.

Por ejemplo:

```javascript
search.createColumn({
  name: 'trandate',
  sort: search.Sort.ASC
})
```

A primera vista parece suficiente.

Pero imaginemos que tenemos:

```text
2026-09-01 → Invoice 100
2026-09-01 → Invoice 101
2026-09-01 → Invoice 102
2026-09-01 → Invoice 103
...
```

Tenemos muchas transacciones con exactamente la misma fecha.

La fecha por sí sola no identifica de forma única la posición de cada registro.

Por eso, cuando una búsqueda va a ser paginada, prefiero utilizar un campo adicional que permita establecer un orden estable.

Por ejemplo:

```javascript
columns: [
  search.createColumn({
    name: 'trandate',
    sort: search.Sort.ASC
  }),

  search.createColumn({
    name: 'internalid',
    sort: search.Sort.ASC
  })
]
```

De esta manera tenemos:

```text
trandate ASC
internalid ASC
```

La fecha establece el orden principal y `internalid` funciona como criterio de desempate.

## ¿Por qué utilizar `internalid`?

Porque cuando trabajamos con paginación queremos que cada registro tenga una posición lo más determinística posible.

Por ejemplo:

```text
Fecha         Internal ID

2026-09-01    100
2026-09-01    101
2026-09-01    102
2026-09-01    103
2026-09-02    104
2026-09-02    105
```

En lugar de depender únicamente de:

```text
ORDER BY trandate
```

podemos pensar conceptualmente en:

```text
ORDER BY trandate, internalid
```

Así, cuando NetSuite divide los resultados en páginas, tenemos un orden mucho más estable.

Esto es especialmente importante en procesos donde **no podemos permitir registros duplicados o que algún registro quede fuera del procesamiento**.

## Una implementación práctica

Un ejemplo completo podría ser:

```javascript
const transactionSearch = search.create({
  type: search.Type.TRANSACTION,

  filters: [['mainline', 'is', 'T']],

  columns: [
    search.createColumn({
      name: 'trandate',
      sort: search.Sort.ASC
    }),

    search.createColumn({
      name: 'internalid',
      sort: search.Sort.ASC
    }),

    'tranid',
    'entity'
  ]
})

const pagedData = transactionSearch.runPaged({
  pageSize: 1000
})

log.audit({
  title: 'Total de resultados',
  details: pagedData.count
})

pagedData.pageRanges.forEach(function (pageRange) {
  const page = pagedData.fetch({
    index: pageRange.index
  })

  page.data.forEach(function (result) {
    const internalId = result.getValue({
      name: 'internalid'
    })

    const tranId = result.getValue({
      name: 'tranid'
    })

    // Procesamiento
  })
})
```

La estructura queda bastante clara:

```text
Search
  ↓
runPaged()
  ↓
Page
  ↓
Resultados
  ↓
Procesamiento
```

## ¿Y si tenemos cientos de miles de registros?

Aquí ya no pensaría únicamente en `runPaged()`.

Supongamos que tenemos:

```text
500,000 transacciones
```

La primera pregunta que me haría no sería:

> ¿Cómo obtengo las 500,000?

Sino:

> ¿Realmente necesito procesar las 500,000 en una sola ejecución?

Porque obtener muchos resultados y procesarlos son dos problemas diferentes.

Podemos tener:

```text
Saved Search
      ↓
runPaged()
      ↓
1,000 resultados
      ↓
Map/Reduce
      ↓
procesamiento distribuido
```

En lugar de intentar guardar todos los resultados en un array:

```javascript
const results = []

page.data.forEach(function (result) {
  results.push(result)
})
```

Eso puede convertirse rápidamente en un problema de memoria.

Es mejor procesar los resultados según la arquitectura que necesite nuestro proceso.

## Otra alternativa: SuiteQL

Cuando la consulta comienza a ser más compleja, otra opción que vale la pena considerar es SuiteQL.

Por ejemplo:

```javascript
const query = `
    SELECT
        id,
        tranid,
        trandate
    FROM
        transaction
    ORDER BY
        trandate ASC,
        id ASC
`
```

Y podemos utilizar:

```javascript
const pagedData = query.runSuiteQLPaged({
  query: query,
  pageSize: 1000
})
```

Esto resulta especialmente interesante cuando necesitamos más control sobre la consulta:

```text
JOIN
WHERE
ORDER BY
GROUP BY
```

En determinados escenarios, SuiteQL puede resultar más apropiado que intentar construir una Saved Search extremadamente compleja.

## No uses `runPaged()` por defecto

Algo que también aprendí es que `runPaged()` no debería convertirse en una regla automática.

Si tenemos:

```text
300 registros
```

probablemente:

```javascript
search.run().each(...)
```

sea perfectamente suficiente.

Si tenemos:

```text
20,000 registros
```

entonces:

```javascript
search.runPaged(...)
```

empieza a tener mucho más sentido.

Y si tenemos cientos de miles de registros y además debemos realizar bastante procesamiento:

```text
Search
   ↓
runPaged()
   ↓
Map/Reduce
```

puede ser una arquitectura mucho más adecuada.

La cantidad de datos y el trabajo que tenemos que hacer sobre ellos deberían determinar la solución.

## Recomendaciones para búsquedas grandes

Cuando tengo una búsqueda que va a alimentar un proceso importante, intento revisar estas cosas:

```text
1. ¿Cuántos resultados puede devolver?

2. ¿Estoy utilizando run().each()?

3. ¿Necesito realmente todos los resultados?

4. ¿Tengo un ordenamiento determinístico?

5. ¿Estoy utilizando internalid como criterio de desempate?

6. ¿Estoy acumulando todos los resultados en memoria?

7. ¿El procesamiento debería ejecutarse en Map/Reduce?

8. ¿Una Saved Search es suficiente?

9. ¿SuiteQL sería una mejor alternativa?

10. ¿Qué pasará cuando el volumen de datos sea 10 veces mayor?
```

Esta última pregunta es especialmente importante.

Un script que funciona perfectamente con:

```text
1,000 registros
```

no necesariamente está preparado para:

```text
100,000 registros
```

## El error más común

Creo que uno de los errores más comunes es pensar:

```javascript
search.run().each(...)
```

y asumir:

> Estoy recorriendo todos los resultados de mi búsqueda.

No necesariamente.

Si la búsqueda puede superar los 4,000 resultados, necesitamos pensar en otra estrategia.

Y cuando utilizamos paginación, también tenemos que pensar en el orden.

No es simplemente:

```text
Tengo muchos registros
        ↓
Uso runPaged()
```

Sino:

```text
Tengo muchos registros
        ↓
Necesito paginar
        ↓
Necesito un orden estable
        ↓
Necesito procesarlos correctamente
        ↓
¿Necesito Map/Reduce?
```

## En resumen

Para mí, la idea principal es esta:

```text
Hasta 4,000 resultados
        ↓
search.run().each()

Más de 4,000
        ↓
search.runPaged()

Consulta más compleja
        ↓
SuiteQL / runSuiteQLPaged()

Muchísimo procesamiento
        ↓
Map/Reduce
```

Pero hay una regla que no deberíamos olvidar cuando usamos paginación:

```text
runPaged()
    +
ordenamiento determinístico
```

Si estoy ordenando por una fecha, un nombre u otro campo que puede repetirse, agregaría un criterio único como `internalid` para hacer el orden mucho más estable.

Al final, el objetivo no es simplemente hacer que una búsqueda funcione hoy.

El objetivo es que siga funcionando cuando el cliente pase de 1,000 registros a 10,000, 100,000 o incluso más.

Ese es uno de los cambios de mentalidad que empiezas a tener cuando dejas de pensar solamente en "hacer que el script funcione" y empiezas a pensar en **cómo va a comportarse cuando el volumen real de NetSuite crezca**.
