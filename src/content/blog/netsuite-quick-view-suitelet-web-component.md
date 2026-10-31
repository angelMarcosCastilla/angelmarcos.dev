---
title: Quick View en NetSuite, Una vista previa flexible con un Web Component y Suitelet
description: Cómo funciona Quick View en NetSuite, qué información muestra, por qué no está disponible en Suitelets y cómo construí una alternativa con un Web Component conectado a un Suitelet.
date: 31 de Octubre, 2026
author: Angel Marcos
minutes: 6
tags: [NetSuite, SuiteScript, Suitelet, JavaScript]
stack: NetSuite
---

Cuando trabajo con registros relacionados en NetSuite, a veces necesito confirmar un dato sin abrir otra página. Para eso existe **Quick View**: paso el mouse sobre un campo compatible y NetSuite muestra información importante del registro relacionado.

Es una función pequeña, pero ayuda bastante en el trabajo diario. En vez de abrir cada registro para validar sus datos, puedo consultar una vista rápida y seguir trabajando en el formulario.

El inconveniente aparece cuando intento usar esta experiencia desde un Suitelet: el Quick View estándar no se comporta igual que en los formularios estándar de NetSuite. En mi caso, esto era especialmente visible con un campo de tipo `entity address`: podía ver la etiqueta **Dirección Principal**, pero no el detalle de la dirección, como departamento, provincia, distrito y calle.

Por eso creé una alternativa propia: un **Web Component** que consulta un Suitelet y muestra una vista previa con los datos que yo decida devolver.

## ¿Qué aporta el Quick View estándar?

Quick View permite consultar información relevante de un registro relacionado sin navegar hasta su página completa. Al pasar el mouse sobre un campo compatible, aparece un popup con datos del registro y, según el caso, accesos para abrirlo o editarlo.

Esto es útil cuando:

- Estoy revisando una transacción y quiero confirmar rápidamente los datos de una entidad relacionada.
- Necesito validar información sin perder el contexto del formulario actual.
- Quiero reducir la navegación entre registros para tareas frecuentes.

La limitación es que esta experiencia depende de los formularios y campos donde NetSuite ofrece el comportamiento estándar. En formularios construidos desde un Suitelet, no siempre tengo ese mismo Quick View ni el nivel de detalle que necesito. Un campo puede mostrar una etiqueta comprensible, pero no necesariamente todos los valores que quiero revisar. En el caso de una dirección, para mí puede ser importante mostrar cada parte de forma explícita.

## La alternativa: un Web Component conectado a un Suitelet

El componente que construí registra el elemento `<custom-quick-view>`. Su contenido es el texto visible y también funciona como activador: al pasar el mouse sobre él, el componente consulta un Suitelet y presenta la respuesta en un popup.

El Suitelet recibe el tipo y el ID del registro. Con esa información hago las búsquedas o lecturas necesarias y devuelvo únicamente los datos que quiero mostrar. Así tengo control sobre el contenido, el título, los enlaces y las acciones de la vista previa.

Por ejemplo, desde un Suitelet puedo crear un campo `INLINEHTML` con este elemento:

```javascript
const quickViewField = form.addField({
  id: 'custpage_address_quick_view',
  type: serverWidget.FieldType.INLINEHTML,
  label: ' '
})

quickViewField.defaultValue =
  '<custom-quick-view record="address" record-id="1">Dirección Principal</custom-quick-view>'
```

El usuario ve **Dirección Principal**. Cuando pasa el mouse por ese texto, el componente envía al Suitelet los valores `recordType=address` y `recordId=1`. El Suitelet resuelve el tipo de registro, ejecuta las búsquedas necesarias y devuelve los datos para el popup.

## Ejemplo: mostrar el detalle de una dirección

En lugar de mostrar solamente la etiqueta del campo, puedo responder desde el Suitelet con cada parte de la dirección:

```javascript
return {
  ok: true,
  title: 'Dirección Principal Angel MC',
  url: '/app/common/entity/custjob.nl?id=123',
  fields: [
    { label: 'Departamento', value: 'Ica', type: 'text' },
    { label: 'Provincia', value: 'Chincha', type: 'text' },
    { label: 'Distrito', value: 'Chincha', type: 'text' },
    { label: 'Dirección', value: 'Calle los alamos 520', type: 'text' }
  ],
  actions: [
    { label: 'Ver', url: '/app/common/entity/custjob.nl?id=123' },
    { label: 'Editar', url: '/app/common/entity/custjob.nl?id=123&e=T' }
  ]
}
```

El componente usa `title` como encabezado, `fields` para las filas y `actions` para los enlaces del pie. En este ejemplo, el popup deja de ser una etiqueta ambigua y presenta por separado el departamento, la provincia, el distrito y la dirección.

<figure style="max-width: 400px; margin: 2rem auto;">
  <img
    src="/blog-images/quick-view.webp"
    alt="Quick View muestra el detalle de la dirección principal y las acciones para ver o editar el registro"
    style="display: block; width: 100%; height: auto; border-radius: 0.5rem;"
  />
  <figcaption style="margin-top: 0.75rem; text-align: center; font-size: 0.875rem; color: #6b7280;">
    Vista previa de una dirección: el Suitelet entrega los campos y las acciones que aparecen en el popup.
  </figcaption>
</figure>

## ¿Cómo instalo y configuro el componente?

Subo `custom-quick-view.js` al File Cabinet de NetSuite y lo importo como módulo AMD desde un Client Script. Desde `pageInit` ejecuto `createQuickView()` para registrar el elemento:

```javascript
define(['./custom-quick-view'], (QuickView) => {
  const pageInit = () => {
    window.CQV_ENDPOINT =
      '/app/site/hosting/scriptlet.nl?script=customscript_cqv_quickview_sl&deploy=customdeploy_cqv_quickview_sl'

    QuickView.createQuickView()
  }

  return { pageInit }
})
```

La ruta AMD debe coincidir con la ubicación del archivo en el File Cabinet. También configuro la URL del Suitelet. Puedo definirla globalmente con `window.CQV_ENDPOINT` o pasarla en el atributo `endpoint` de cada componente. Si no indico ninguna, el módulo usa `CustomQuickView.settings.defaultEndpoint`, que debo actualizar antes de desplegar.

El componente también carga Floating UI desde la URL configurada en `CustomQuickView.settings.floatingUrl`. Si prefiero no depender de una CDN, puedo subir ese bundle al File Cabinet y apuntar la configuración a ese archivo.

## La flexibilidad está en el Suitelet

La vista no está atada a una única búsqueda ni a un tipo de registro. El componente envía el tipo y el ID; luego el Suitelet decide cómo obtener los datos y qué devolver. Puedo preparar handlers por tipo de registro, consultar campos relacionados, armar una dirección legible y ofrecer acciones específicas.

La petición actual del componente es `GET` y envía `recordType` y `recordId`. La respuesta exitosa debe incluir `ok: true`. Para errores o registros que no admito, devuelvo `ok: false` con un mensaje que explique qué ocurrió.

Los campos pueden ser de tipo `text`, `email`, `phone`, `url` o `address`. También puedo proporcionar `link` para un enlace personalizado. Así reutilizo el mismo elemento visual mientras adapto el contenido a la información que necesita cada caso.

## Lo que debo tener en cuenta

- El Suitelet es responsable de autorizar y obtener los datos adecuados para quien realiza la petición.
- La URL debe apuntar al deployment correcto; puedo configurarla por elemento o como valor global.
- La URL del bundle de Floating UI debe estar disponible desde el entorno de NetSuite, ya sea mediante CDN o desde el File Cabinet.
- Los IDs y rutas del ejemplo son ilustrativos; tengo que reemplazarlos por los del Suitelet y deployment reales.
- La implementación permite mostrar la información que necesito, pero la calidad de la vista depende de las búsquedas y del formato que prepare en el Suitelet.

## Código fuente

El código del Web Component y los ejemplos están disponibles en el repositorio <a href="https://github.com/angelMarcosCastilla/netsuite-utilities/tree/main/src/preview-record" target="_blank" rel="noopener noreferrer">`netsuite-utilities`, carpeta `src/preview-record`</a>.

## Conclusión

Cuando puedo, prefiero usar el Quick View nativo de NetSuite. Si necesito mostrar información adicional o cruzar datos de distintos registros, este Web Component me da la flexibilidad de consultar un Suitelet y elegir exactamente qué presentar.
