---
title: Glossary
description: The words Luvin uses, one per concept.
sidebar:
  order: 6
---

| Word | Meaning |
|---|---|
| **Workflow** | A sequence of API calls where each step can use data from the previous ones. |
| **Step** | One call in a workflow: an API operation, a message, or another workflow. |
| **Input** | A value the workflow or a case starts with. |
| **Output** | A value a step exposes to the next ones, taken from its response. |
| **Case** | One run of a workflow with specific inputs and an expected outcome. |
| **Verdict** | How a case ended: passed, failed, warning or inconclusive. |
| **Contract** | An OpenAPI or AsyncAPI file that describes an API. |
| **Arazzo** | The open standard file where a workflow is written. |
| **Environment** | The base URLs, variables and secrets for one place, such as local or production. |
| **Collection** | A folder with the contracts, Arazzo files, environments, cases and requests of one project. |
| **Workspace** | A folder that holds collections. |
| **Request** | A single API call saved on its own, outside a workflow. |
| **Simulation** | A run answered from the contract examples, with no network calls. |
| **Secret** | A variable whose value is never written to the workspace files. Only its name is. |
| **Real API** | A run mode that calls the API with the base URLs and credentials of the active environment. |
| **Reusable** | A parameter or an action declared once in `components` and used by reference from several steps. |
| **dependsOn** | A workflow that needs another one to run first. Its outputs are available as `$workflows.<id>.outputs`. |
| **Dev Tools** | The panel with the Console, Network, Performance and Terminal tabs. See [Dev Tools](/dev-tools/overview/). |
| **Session** | What Luvin saves on this device when you work without a workspace, without credentials. |

## Related

- [Workspaces and collections](/workspaces/overview/)
- [Specification support](/reference/support/)
