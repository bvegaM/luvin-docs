---
title: Glosario
description: Las palabras que usa Luvin, una por concepto.
sidebar:
  order: 6
---

| Palabra | Qué significa |
|---|---|
| **Workflow** | Una secuencia de llamadas a APIs en la que cada paso puede usar datos de los anteriores. |
| **Paso** | Una llamada dentro de un workflow: una operación de una API, un mensaje u otro workflow. |
| **Input** | Un valor con el que empieza el workflow o un caso. |
| **Output** | Un valor que un paso expone a los siguientes, tomado de su respuesta. |
| **Caso** | Una ejecución de un workflow con inputs concretos y un resultado esperado. |
| **Veredicto** | Cómo terminó un caso: pasó, no pasó, advertencia o no concluyente. |
| **Contrato** | Un archivo OpenAPI o AsyncAPI que describe una API. |
| **Arazzo** | El archivo de estándar abierto donde se escribe un workflow. |
| **Ambiente** | Las URLs base, variables y secretos de un lugar, como local o producción. |
| **Colección** | Una carpeta con los contratos, archivos Arazzo, ambientes, casos y requests de un proyecto. |
| **Workspace** | Una carpeta que contiene colecciones. |
| **Request** | Una sola llamada a una API guardada por separado, fuera de un workflow. |
| **Simulación** | Una ejecución que se responde con los ejemplos del contrato, sin llamadas de red. |
| **Secreto** | Una variable cuyo valor nunca se escribe en los archivos del workspace. Solo se escribe su nombre. |
| **API real** | Un modo de ejecución que llama a la API con las URLs base y las credenciales del ambiente activo. |
| **Reutilizable** | Un parámetro o una acción declarados una vez en `components` y usados por referencia desde varios pasos. |
| **dependsOn** | Un workflow que necesita que otro corra primero. Sus outputs quedan disponibles como `$workflows.<id>.outputs`. |
| **Dev Tools** | El panel con las pestañas Console, Network, Performance y Terminal. Mira [Dev Tools](/es/dev-tools/overview/). |
| **Sesión** | Lo que Luvin guarda en este dispositivo cuando trabajas sin workspace, sin credenciales. |

## Relacionado

- [Workspaces y colecciones](/es/workspaces/overview/)
- [Soporte de especificaciones](/es/reference/support/)
