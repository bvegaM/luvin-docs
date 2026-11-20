---
title: Expresiones de runtime
description: Todas las expresiones que Luvin entiende en parámetros, bodies, outputs, criterios y el YAML, qué devuelve cada una y en qué se diferencian de una {{variable}}.
sidebar:
  order: 7
---

Una expresión de runtime es un texto corto que empieza con `$` y apunta a un valor que solo existe mientras corre un workflow, como un input, un dato de una respuesta o el output de un paso anterior. Luvin la reemplaza por el valor real cuando está por enviar el paso o cuando revisa un criterio.

Escribes expresiones en la pestaña **YAML** y en **Editar como JSON** del body de un request. En la pestaña Diseño casi nunca las escribes: cuando conectas datos, Luvin las escribe por ti. Lee esta página cuando abras el YAML y quieras saber qué significa un `$...`.

## Todas las formas

| Expresión | Qué devuelve | Ejemplo |
|---|---|---|
| `$inputs.<nombre>` | El valor de un input del workflow, o del caso que se ejecuta. | `$inputs.pokemon` |
| `$steps.<paso>.outputs.<nombre>` | Un output que capturó un paso anterior. | `$steps.getPokemon.outputs.mainType` |
| `$workflows.<id>.outputs.<nombre>` | Un output de otro workflow del que este depende (`dependsOn`). | `$workflows.typeExplorer.outputs.strongAgainst` |
| `$response.body` | El body completo de la respuesta del paso actual. | `$response.body` |
| `$response.body#/puntero` | Un dato del body. Lo que va después de `#` es un JSON Pointer: `/` entre nombres y la posición de un elemento de lista como número. | `$response.body#/types/0/type/name` |
| `$response.header.<nombre>` | Un header de la respuesta. El nombre no distingue mayúsculas. | `$response.header.Content-Type` |
| `$statusCode` | El status HTTP de la respuesta, como número. | `$statusCode == 200` |
| `$url` | La URL a la que se llamó. | `$url` |
| `$method` | El método HTTP, en mayúsculas. | `$method` |
| `$request.header.<nombre>` | Un header que se envió. | `$request.header.Accept` |
| `$request.query.<nombre>` | Un parámetro query que se envió. | `$request.query.limit` |
| `$request.path.<nombre>` | Un parámetro de ruta que se envió. | `$request.path.id` |
| `$request.body` o `$request.body#/puntero` | El body que se envió, o un dato de él. | `$request.body#/customer/id` |
| `$message.payload` o `$message.payload#/puntero` | El payload del mensaje de un paso de mensajería. `$message.body` funciona igual. | `$message.payload#/status` |
| `$message.header.<nombre>` | Un header de ese mensaje. | `$message.header.correlationId` |
| `$sourceDescriptions.<nombre>.url` | La URL de un contrato del archivo Arazzo. | `$sourceDescriptions.pokedexEvents.url` |
| `$components.<tipo>.<nombre>` | Un reutilizable declarado en `components`. | `$components.parameters.requestId` |
| `$outputs.<nombre>` | Un output de un workflow llamado como paso, dentro del paso que lo llama. | `$outputs.orderId` |
| `$self` | La identidad del documento Arazzo, si el archivo declara una. | `$self` |

:::note
En la pestaña Diseño, los datos de una lista se muestran sin su posición: `types/type/name`. El YAML conserva la posición que eligió Luvin: `$response.body#/types/0/type/name`. Mira [Elige un elemento de una lista](/es/test/lists/).
:::

## Dónde se usa cada forma

| Dónde la escribes | Expresiones que verás normalmente |
|---|---|
| Un **parámetro** o un dato del **body del request** | `$inputs`, `$steps`, `$workflows`, `$components`. |
| Un **output** de un paso | `$response.body`, `$response.header`, `$statusCode`, `$message`. |
| Un **criterio de éxito** | `$statusCode`, `$response`, `$message`, `$inputs`, `$steps`. Mira [Criterios de éxito](/es/reference/criteria/). |
| Los **outputs de un workflow** | `$steps.<paso>.outputs.<nombre>`, `$workflows.<id>.outputs.<nombre>`. |
| El **canal** de un paso de mensajería | `$sourceDescriptions.<nombre>.url` entre llaves. |

Las expresiones sobre la respuesta (`$response`, `$statusCode`) solo tienen valor después de que el paso recibió su respuesta. Usadas antes, no devuelven nada.

## Usa una expresión dentro de un texto

Una expresión que es el valor completo conserva su tipo: un número sigue siendo número. Cuando quieres una expresión dentro de un texto más largo, ponla entre llaves: `{$expresión}`. Luvin la reemplaza por su valor. Un valor que es un objeto o una lista se escribe como JSON.

El ejemplo del Pokédex lo hace para apuntar a un canal de un contrato:

```yaml
channelPath: '{$sourceDescriptions.pokedexEvents.url}#/channels/sightingConfirmed'
```

Si una expresión no se puede resolver, la parte dentro del texto queda vacía. Un valor completo que no se puede resolver queda vacío, y el paso informa qué faltaba. Mira [Dato no disponible](/es/reference/failure-reasons/).

## Las expresiones no son variables

Dos tipos de marcadores se parecen. Se resuelven en momentos distintos y desde lugares distintos.

| | Expresión de runtime | Plantilla |
|---|---|---|
| Se escribe | `$inputs.name`, `{$steps...}` | `{{variable}}`, `{{$randomUUID}}`, `{{email}}` |
| Viene de | La ejecución: inputs, respuestas, outputs. | El **ambiente** activo (variables y secretos), o un generador de datos. |
| Ejemplo | `$steps.getPokemon.outputs.id` | `{{baseUrl}}`, `{{$randomFirstName}}` |
| Cuándo | Mientras corre el workflow, paso a paso. | Primero, cuando se prepara el valor. |

Las plantillas se reemplazan primero. Un `{{nombre}}` que no es una variable del ambiente ni un generador se deja tal cual. En un request, una franja amarilla bajo la barra de la URL lo dice antes de enviarlo, con **Abrir el ambiente**. En un workflow no hay franja: el campo muestra la variable en rojo. Los generadores son `{{email}}`, `{{cpf}}`, `{{rut}}`, `{{uuid}}`, `{{numero:8}}`, `{{fecha}}` y `{{timestamp}}`, además de las variables dinámicas como `{{$randomUUID}}`. Mira [Variables dinámicas](/es/environments/dynamic-variables/) y [URLs base, variables y secretos](/es/environments/variables-and-secrets/).

:::tip
`{{$guid}}` con dos llaves es una plantilla. `$steps.a.outputs.id` sin llaves es una expresión. Si las confundes, el valor queda como lo escribiste y la API recibe el texto equivocado.
:::

## Selectores (Arazzo 1.1)

Arazzo 1.1 también permite escribir un valor como un objeto con tres campos: dónde buscar (`context`), qué buscar (`selector`) y cómo (`type`). El ejemplo del Pokédex lo usa en un output:

```yaml
context: $response.body
selector: $.effect_entries[?(@.language.name == 'en')].short_effect
type: jsonpath
```

El `type` puede ser `jsonpath`, `jsonpointer` o `xpath`. Luvin soporta XPath 1.0.

## Relacionado

- [Criterios de éxito](/es/reference/criteria/)
- [Outputs](/es/design/outputs/)
- [Conectar datos entre pasos](/es/design/wire-data/)
- [Glosario](/es/reference/glossary/)
