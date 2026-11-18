---
title: Criterios de éxito
description: Cómo decide Luvin que un paso funcionó, la sintaxis de los criterios simples, regex, JSONPath y XPath, y cómo se explica un criterio que falla.
sidebar:
  order: 8
---

Un criterio de éxito es una regla que una respuesta debe cumplir para que un paso cuente como exitoso. Un paso puede tener varios criterios, y todos deben cumplirse. Esta página explica cómo escribirlos y cómo leer la explicación cuando uno no se cumple.

## Cuando un paso no tiene criterios

Si un paso no tiene criterios, Luvin acepta cualquier respuesta **2xx**. En los resultados el criterio aparece como **(implícito) respuesta 2xx**. Si la API responde otra cosa, el motivo dice **Se esperaba un 2xx, pero vale 404**, con el status real.

Cuando arrastras una operación al canvas, Luvin escribe un criterio a partir del status que el contrato documenta como exitoso. Puedes cambiarlo en el panel del paso. Mira [Éxito y errores](/es/design/success-and-errors/).

:::note
Una lista de criterios vacía escrita a mano (`successCriteria: []`) se informa en la pestaña YAML como advertencia: Arazzo 1.1 exige al menos un criterio cuando la lista se declara. Mira [Mensajes del análisis y del contrato](/es/reference/analysis-messages/).
:::

## Condiciones simples

Una condición simple compara valores y da verdadero o falso. Es el tipo por defecto, así que no escribes `type`.

```yaml
successCriteria:
  - condition: $statusCode == 200
  - condition: $response.body#/capture_rate >= 0
```

Las dos líneas vienen del workflow "Pokemon card" del ejemplo Pokédex.

| Operador | Significado |
|---|---|
| `==` | Igual a. |
| `!=` | Distinto de. |
| `<` `<=` | Menor que, menor o igual a. |
| `>` `>=` | Mayor que, mayor o igual a. |
| `&&` | Deben cumplirse los dos lados. |
| `\|\|` | Debe cumplirse al menos un lado. |
| `!` | Invierte una condición. |
| `( )` | Agrupa condiciones. |

Los valores que comparas pueden ser:

- Una [expresión de runtime](/es/reference/expressions/), como `$statusCode` o `$response.body#/status`.
- Un texto entre comillas: `'ACTIVE'`.
- Un número, `true`, `false` o `null`.

Dos detalles que sorprenden:

- **Los textos se comparan sin distinguir mayúsculas.** `'active'` es igual a `'ACTIVE'`.
- **Un número y un texto que parece número son iguales.** `10` es igual a `'10'`.

Para aceptar varios status, usa `||`: `$statusCode == 200 || $statusCode == 201`.

:::caution[Dos criterios `$statusCode ==` nunca funcionan juntos]
Todos los criterios deben cumplirse a la vez, así que un paso con `$statusCode == 200` y `$statusCode == 404` en dos criterios separados nunca puede tener éxito. La pestaña YAML lo marca como error y propone la solución: un solo criterio con `||`.
:::

## Expresiones regulares

Un criterio `regex` revisa que un valor tenga cierto formato. Necesita un `context`, la expresión que dice qué revisar, y una `condition`, el patrón.

```yaml
- context: $response.header.Content-Type
  condition: ^application/json
  type: regex
```

Si el valor no es texto, primero se convierte en texto JSON. Un patrón que nombra datos del body, como `"status":"ACTIVE"`, se explica dato por dato cuando falla.

## JSONPath

Un criterio `jsonpath` busca algo en un valor JSON. El criterio se cumple cuando la ruta encuentra al menos una coincidencia. El ejemplo del Pokédex revisa que un Pokémon tenga al menos una habilidad visible:

```yaml
- context: $response.body
  condition: $.abilities[?(@.is_hidden == false)]
  type: jsonpath
```

`$.abilities[?(@.is_hidden == false)]` se lee: en `abilities`, los elementos cuyo `is_hidden` es falso.

:::note
Una condición simple como `$statusCode == 200` marcada por error como `type: jsonpath` se evalúa como condición simple. El análisis te dice que le quites `type: jsonpath` y `context`.
:::

## XPath

Un criterio `xpath` hace lo mismo sobre una respuesta o un mensaje XML. Luvin soporta **XPath 1.0**.

```yaml
- context: $response.body
  condition: /order/status
  type: xpath
```

Si el valor de `context` no es XML, el criterio no se cumple y el motivo lo dice.

## Partes de un criterio

| Campo | Se necesita en | Qué es |
|---|---|---|
| `condition` | Todos los tipos | La regla. |
| `type` | `regex`, `jsonpath`, `xpath` | El tipo de regla. Omítelo en una condición simple. |
| `context` | `regex`, `jsonpath`, `xpath` | La expresión con el valor a revisar, normalmente `$response.body`. |

## Cuando un criterio no se cumple

Los resultados muestran cada criterio con **Se cumple** o **No se cumple**, y el motivo en palabras simples. Las frases siempre tienen la misma forma, así que puedes reconocerlas.

| Lo que ves | Qué significa | Qué hacer |
|---|---|---|
| **Se esperaba $statusCode igual a 200, pero vale 404** | Falló una comparación. Nombra la expresión, el operador, el valor esperado y el real. | Abre la respuesta del paso. Si la API tiene razón, cambia el criterio. Si no, repórtalo. |
| **La condición evaluó a falso o no tiene valor.** | Una condición sin comparación dio falso, o el valor no existe. | Revisa que la expresión apunte a un dato que la respuesta tenga. |
| **"status" vale INACTIVE y se esperaba ACTIVE** | Un criterio regex que nombra datos. El valor real aparece junto al esperado. | Compara el dato en la respuesta. |
| **$response.body = ... no cumple /patrón/** | Una regex no coincidió con el valor. | Revisa el patrón y el valor real. |
| **JSONPath no encontró coincidencias en $response.body.** | La ruta no encontró nada. | Compara la ruta con la respuesta en **Network**. |
| **XPath no encontró coincidencias en $response.body.** | La ruta no encontró nada. | Lo mismo, con el XML. |
| **$response.body no es XML: XPath solo se aplica a respuestas o mensajes XML.** | La respuesta no es XML. | Usa JSONPath para JSON. |
| **El criterio de tipo "regex" necesita "context".** | Falta el campo `context`. | Agrégalo en el YAML. |
| **El contexto $response.body no tiene valor.** | La expresión de `context` no devolvió nada. | La respuesta no tiene body, o el paso falló antes. |
| **Sintaxis no reconocida en la condición**, **Falta cerrar un paréntesis**, **La condición termina de forma inesperada**, **Token inesperado "..."** | La condición no está bien escrita. | Corrige el texto de la condición en la pestaña YAML. |
| **Tipo de criterio "..." no soportado.** | El `type` no es `simple`, `regex`, `jsonpath` ni `xpath`. | Usa uno de ellos. |
| **No se pudo evaluar la condición: ...** | Un problema inesperado, por ejemplo una expresión regular inválida. | Lee el mensaje después de los dos puntos. |

En los resultados, un criterio que falla también resalta el dato de la respuesta donde está la diferencia. Mira [Lee el resultado de un paso](/es/test/step-results/).

## La misma regla en palabras simples

Para quien no escribe condiciones, Luvin muestra cada criterio como una frase. `$statusCode == 200` se lee **La API responde 200 (OK)**. La comparación de un dato se lee **El dato «status» de la respuesta es «ACTIVE»**. Una regla que Luvin no puede poner en palabras se lee **Se cumple la regla técnica del paso**, y la regla real aparece al lado.

## Relacionado

- [Expresiones de runtime](/es/reference/expressions/)
- [Por qué falló un paso o un caso](/es/reference/failure-reasons/)
- [Éxito y errores](/es/design/success-and-errors/)
- [Lee el resultado de un paso](/es/test/step-results/)
