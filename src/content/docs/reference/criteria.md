---
title: Success criteria
description: How Luvin decides that a step worked, the syntax of simple, regex, JSONPath and XPath criteria, and how a criterion that fails is explained.
sidebar:
  order: 8
---

A success criterion is a rule that a response must meet for a step to count as successful. A step can have several criteria, and all of them must hold. This page explains how to write them and how to read the explanation when one is not met.

## When a step has no criteria

If a step has no criteria, Luvin accepts any **2xx** response. In the results the criterion appears as **(implicit) 2xx response**. If the API answers something else, the reason reads **Expected a 2xx, but it is 404**, with the real status.

When you drag an operation onto the canvas, Luvin writes a criterion from the status the contract documents as successful. You can change it in the step panel. See [Success and errors](/design/success-and-errors/).

:::note
An empty list of criteria written by hand (`successCriteria: []`) is reported in the YAML tab as a warning: Arazzo 1.1 requires at least one criterion when the list is declared. See [Analysis and contract messages](/reference/analysis-messages/).
:::

## Simple conditions

A simple condition compares values and gives true or false. It is the default type, so you do not write `type`.

```yaml
successCriteria:
  - condition: $statusCode == 200
  - condition: $response.body#/capture_rate >= 0
```

Both lines come from the "Pokemon card" workflow of the Pokédex example.

| Operator | Meaning |
|---|---|
| `==` | Equal to. |
| `!=` | Different from. |
| `<` `<=` | Less than, less than or equal to. |
| `>` `>=` | Greater than, greater than or equal to. |
| `&&` | Both sides must hold. |
| `\|\|` | At least one side must hold. |
| `!` | Reverses a condition. |
| `( )` | Groups conditions. |

The values you compare can be:

- A [runtime expression](/reference/expressions/), such as `$statusCode` or `$response.body#/status`.
- A text between quotes: `'ACTIVE'`.
- A number, `true`, `false` or `null`.

Two details that surprise people:

- **Text is compared without distinguishing capitals.** `'active'` equals `'ACTIVE'`.
- **A number and a text that looks like a number are equal.** `10` equals `'10'`.

To accept several statuses, use `||`: `$statusCode == 200 || $statusCode == 201`.

:::caution[Two `$statusCode ==` criteria never work together]
Every criterion must hold at once, so a step with `$statusCode == 200` and `$statusCode == 404` in two separate criteria can never succeed. The YAML tab marks it as an error and proposes the fix: one criterion with `||`.
:::

## Regular expressions

A `regex` criterion checks that a value has a given format. It needs a `context`, the expression that says what to check, and a `condition`, the pattern.

```yaml
- context: $response.header.Content-Type
  condition: ^application/json
  type: regex
```

If the value is not text, it is turned into JSON text first. A pattern that names fields of the body, such as `"status":"ACTIVE"`, is explained field by field when it fails.

## JSONPath

A `jsonpath` criterion looks for something in a JSON value. The criterion holds when the path finds at least one match. The Pokédex example checks that a Pokémon has at least one visible ability:

```yaml
- context: $response.body
  condition: $.abilities[?(@.is_hidden == false)]
  type: jsonpath
```

`$.abilities[?(@.is_hidden == false)]` reads: in `abilities`, the items whose `is_hidden` is false.

:::note
A simple condition such as `$statusCode == 200` marked as `type: jsonpath` by mistake is evaluated as a simple condition. The analysis tells you to remove `type: jsonpath` and `context` from it.
:::

## XPath

An `xpath` criterion does the same on an XML response or message. Luvin supports **XPath 1.0**.

```yaml
- context: $response.body
  condition: /order/status
  type: xpath
```

If the value in `context` is not XML, the criterion is not met and the reason says so.

## Parts of a criterion

| Field | Needed for | What it is |
|---|---|---|
| `condition` | All types | The rule. |
| `type` | `regex`, `jsonpath`, `xpath` | The kind of rule. Leave it out for a simple condition. |
| `context` | `regex`, `jsonpath`, `xpath` | The expression with the value to check, usually `$response.body`. |

## When a criterion is not met

The results show every criterion with **Met** or **Not met**, and the reason in plain words. The sentences are always the same shape, so you can recognise them.

| What you see | What it means | What to do |
|---|---|---|
| **Expected $statusCode equal to 200, but it is 404** | A comparison failed. It names the expression, the operator, the expected value and the real one. | Open the response of the step. If the API is right, change the criterion. If not, report it. |
| **The condition evaluated to false or has no value.** | A condition without a comparison gave false, or the value does not exist. | Check that the expression points to a field that the response has. |
| **"status" is INACTIVE but ACTIVE was expected** | A regex criterion that names fields. The real value is shown next to the expected one. | Compare the field in the response. |
| **$response.body = ... does not match /pattern/** | A regex did not match the value. | Check the pattern and the real value. |
| **JSONPath found no matches in $response.body.** | The path found nothing. | Check the path against the response in **Network**. |
| **XPath found no matches in $response.body.** | The path found nothing. | Same, with the XML. |
| **$response.body is not XML: XPath only applies to XML responses or messages.** | The response is not XML. | Use JSONPath for JSON. |
| **A criterion of type "regex" needs "context".** | The `context` field is missing. | Add it in the YAML. |
| **Context $response.body has no value.** | The expression in `context` returned nothing. | The response has no body, or the step failed earlier. |
| **Unrecognized syntax in the condition**, **A parenthesis is not closed**, **The condition ends unexpectedly**, **Unexpected token "..."** | The condition is not written correctly. | Fix the text of the condition in the YAML tab. |
| **Criterion type "..." is not supported.** | The `type` is none of `simple`, `regex`, `jsonpath` or `xpath`. | Use one of those. |
| **The condition could not be evaluated: ...** | An unexpected problem, for example an invalid regular expression. | Read the message after the colon. |

In the results, a failing criterion also highlights the field of the response where the difference is. See [Read a step result](/test/step-results/).

## The same rule in plain words

For readers who do not write conditions, Luvin shows each criterion as a sentence. `$statusCode == 200` reads **The API responds 200 (OK)**. A comparison of a field reads **The «status» field of the response is «ACTIVE»**. A rule Luvin cannot put in words reads **The step's technical rule is met**, and the real rule is shown next to it.

## Related

- [Runtime expressions](/reference/expressions/)
- [Why a step or a case failed](/reference/failure-reasons/)
- [Success and errors](/design/success-and-errors/)
- [Read a step result](/test/step-results/)
