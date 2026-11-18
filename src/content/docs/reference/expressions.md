---
title: Runtime expressions
description: Every expression Luvin understands in parameters, bodies, outputs, criteria and the YAML, what each one returns, and how it differs from a {{variable}}.
sidebar:
  order: 7
---

A runtime expression is a short piece of text that starts with `$` and points to a value that exists only while a workflow runs, such as an input, a field of a response or the output of an earlier step. Luvin replaces it with the real value when the step is about to be sent, or when a criterion is checked.

You write expressions in the **YAML** tab and in **Edit as JSON** of a request body. In the Design tab you rarely type them: when you wire data, Luvin writes them for you. Read this page when you open the YAML and want to know what a `$...` means.

## All the forms

| Expression | Returns | Example |
|---|---|---|
| `$inputs.<name>` | The value of an input of the workflow, or of the case being run. | `$inputs.pokemon` |
| `$steps.<step>.outputs.<name>` | An output that an earlier step captured. | `$steps.getPokemon.outputs.mainType` |
| `$workflows.<id>.outputs.<name>` | An output of another workflow that this one depends on (`dependsOn`). | `$workflows.typeExplorer.outputs.strongAgainst` |
| `$response.body` | The whole body of the response of the current step. | `$response.body` |
| `$response.body#/pointer` | One field of the body. The part after `#` is a JSON Pointer: `/` between names and the position of a list item as a number. | `$response.body#/types/0/type/name` |
| `$response.header.<name>` | A header of the response. The name is not case sensitive. | `$response.header.Content-Type` |
| `$statusCode` | The HTTP status of the response, as a number. | `$statusCode == 200` |
| `$url` | The URL that was called. | `$url` |
| `$method` | The HTTP method, in capitals. | `$method` |
| `$request.header.<name>` | A header that was sent. | `$request.header.Accept` |
| `$request.query.<name>` | A query parameter that was sent. | `$request.query.limit` |
| `$request.path.<name>` | A path parameter that was sent. | `$request.path.id` |
| `$request.body` or `$request.body#/pointer` | The body that was sent, or one field of it. | `$request.body#/customer/id` |
| `$message.payload` or `$message.payload#/pointer` | The payload of the message of a messaging step. `$message.body` works the same. | `$message.payload#/status` |
| `$message.header.<name>` | A header of that message. | `$message.header.correlationId` |
| `$sourceDescriptions.<name>.url` | The URL of a contract of the Arazzo file. | `$sourceDescriptions.pokedexEvents.url` |
| `$components.<kind>.<name>` | A reusable declared in `components`. | `$components.parameters.requestId` |
| `$outputs.<name>` | An output of a workflow called as a step, inside the step that calls it. | `$outputs.orderId` |
| `$self` | The identity of the Arazzo document, if the file declares one. | `$self` |

:::note
In the Design tab, list fields are shown without their position: `types/type/name`. The YAML keeps the position that Luvin chose: `$response.body#/types/0/type/name`. See [Choose an item from a list](/test/lists/).
:::

## Where each form is usually used

| Where you write it | Expressions you usually see |
|---|---|
| A **parameter** or a field of the **request body** | `$inputs`, `$steps`, `$workflows`, `$components`. |
| An **output** of a step | `$response.body`, `$response.header`, `$statusCode`, `$message`. |
| A **success criterion** | `$statusCode`, `$response`, `$message`, `$inputs`, `$steps`. See [Success criteria](/reference/criteria/). |
| The **outputs of a workflow** | `$steps.<step>.outputs.<name>`, `$workflows.<id>.outputs.<name>`. |
| A **channel** of a messaging step | `$sourceDescriptions.<name>.url` inside braces. |

Expressions about the response (`$response`, `$statusCode`) only have a value after the step has been answered. Used before that, they return nothing.

## Use an expression inside a text

An expression that is the whole value keeps its type: a number stays a number. When you want an expression inside a longer text, wrap it in braces: `{$expression}`. Luvin replaces it by its value. A value that is an object or a list is written as JSON.

The Pokédex example does this to point to a channel of a contract:

```yaml
channelPath: '{$sourceDescriptions.pokedexEvents.url}#/channels/sightingConfirmed'
```

If an expression cannot be resolved, the part inside the text becomes empty. A whole value that cannot be resolved stays empty, and the step reports what was missing. See [Data not available](/reference/failure-reasons/).

## Expressions are not variables

Two kinds of placeholders look similar. They are resolved at different moments and from different places.

| | Runtime expression | Template |
|---|---|---|
| Written as | `$inputs.name`, `{$steps...}` | `{{variable}}`, `{{$randomUUID}}`, `{{email}}` |
| Comes from | The run: inputs, responses, outputs. | The active **environment** (variables and secrets), or a data generator. |
| Example | `$steps.getPokemon.outputs.id` | `{{baseUrl}}`, `{{$randomFirstName}}` |
| When | While the workflow runs, step by step. | First, when the value is prepared. |

Templates are replaced first. A `{{name}}` that is neither a variable of the environment nor a generator is left as written, and Luvin warns you before sending it. The generators are `{{email}}`, `{{cpf}}`, `{{rut}}`, `{{uuid}}`, `{{number:8}}`, `{{date}}` and `{{timestamp}}`, plus the dynamic variables such as `{{$randomUUID}}`. See [Dynamic variables](/environments/dynamic-variables/) and [Base URLs, variables and secrets](/environments/variables-and-secrets/).

:::tip
`{{$guid}}` with two braces is a template. `$steps.a.outputs.id` without braces is an expression. If you mix them up, the value stays as typed and the API receives the wrong text.
:::

## Selectors (Arazzo 1.1)

Arazzo 1.1 also lets you write a value as an object with three fields: where to look (`context`), what to look for (`selector`) and how (`type`). The Pokédex example uses it in an output:

```yaml
context: $response.body
selector: $.effect_entries[?(@.language.name == 'en')].short_effect
type: jsonpath
```

The `type` can be `jsonpath`, `jsonpointer` or `xpath`. Luvin supports XPath 1.0.

## Related

- [Success criteria](/reference/criteria/)
- [Outputs](/design/outputs/)
- [Connect data between steps](/design/wire-data/)
- [Glossary](/reference/glossary/)
