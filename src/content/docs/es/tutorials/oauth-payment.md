---
title: Prueba un flujo de pago con OAuth 2.0
description: Abre el ejemplo de PayPal, mira cómo Luvin obtiene solo el token de acceso, ejecuta una captura en Simulación y prepara el sandbox de PayPal para ejecutarla de verdad.
sidebar:
  order: 3
---

Vas a explorar un flujo de pago armado sobre el Orders API de PayPal: crear una orden, capturar el pago y emitir un recibo. Lo ejecutarás en Simulación, sin credenciales, y después verás qué cambiar para ejecutarlo contra el sandbox de PayPal. La primera parte toma unos 15 minutos y no necesita nada más. La segunda necesita una cuenta de desarrollador de PayPal, que es gratis.

OAuth 2.0 significa que la API no acepta una clave fija: pide un token de acceso que primero debes solicitar y que vence. Luvin lo solicita, lo reutiliza y lo envía en cada llamada.

## 1. Abre el ejemplo de PayPal

1. En la pantalla de bienvenida, haz clic en **Ver más ejemplos**, abajo. Si ya abriste un workspace antes, haz clic en **Ver los ejemplos**.
2. Haz clic en **Probar pagos con PayPal**.

Luvin abre la colección **PayPal** en el workspace **Ejemplos**. Se abre en **Simulación**, porque todavía no hay credenciales.

## 2. Mira los tres workflows

En la barra lateral, bajo la colección, hay tres workflows:

| Workflow | Qué hace |
|---|---|
| **Create order** | Crea una orden por un monto y la vuelve a leer. Devuelve `orderId`, `approveUrl` y `status`. |
| **Capture order** | Comprueba que el comprador aprobó la orden, captura el pago y espera el webhook que lo confirma. |
| **Order receipt** | Depende de **Create order**: usa el id de la orden que ese workflow devolvió. |

1. Haz clic en **Create order** y abre la pestaña **Diseño**.

Las tarjetas marcadas con ♻ usan *reutilizables*: el header de idempotencia `PayPal-Request-Id` y las acciones ante los errores 400 y 401 se escriben una vez y se usan en varios pasos. Mira [Reutilizables](/es/design/reusables/).

## 3. Mira de dónde sale el token

1. Haz clic en la pestaña **Autorización** de **Create order**.

Una tarjeta muestra la API `paypal`. Dice **Se usa: OAuth 2.0 · definida para todos los workflows**. Ábrela para ver los campos:

| Campo | Valor |
|---|---|
| **Tipo de grant** | Client Credentials |
| **URL del token** | `https://api-m.sandbox.paypal.com/v1/oauth2/token` |
| **Client ID** | `{{clientId}}` |
| **Client Secret** | `{{clientSecret}}` |

![La pestaña Autorización de un workflow, con una tarjeta por API](/media/es/workflow-auth.webp)

El client id y el secret no se escriben aquí: son variables, `{{clientId}}` y `{{clientSecret}}`, que toman su valor del ambiente activo. El archivo Arazzo no sabe nada de autorización. Luvin guarda este ajuste en `flow-auth.yaml`. Mira [Autorización de un workflow](/es/authorization/workflow/) y [OAuth 2.0](/es/authorization/oauth2/).

## 4. Ejecuta Capture order en Simulación

1. Haz clic en **Capture order** y abre la pestaña **Inputs**. El input `orderId` ya tiene un valor de ejemplo.
2. Abre la pestaña **Casos**. Además de **Camino feliz**, Luvin generó casos por respuesta, por ejemplo uno donde el paso `capture` responde 422 y el workflow termina por la acción `notApproved`.
3. En la barra de ejecución, comprueba que esté elegida **Simulación**.
4. Haz clic en **Ejecutar**.

Junto al nombre del workflow, una nota dice que un paso de mensajería se simula. Es el último paso, `awaitCaptureEvent`: espera el webhook `PAYMENT.CAPTURE.COMPLETED`. Luvin no recibe eventos de PayPal: **los webhooks siempre se simulan**, tanto en Simulación como contra la API real.

En los resultados, abre el caso **Camino feliz**. Los tres pasos `checkOrder`, `capture` y `awaitCaptureEvent` responden con los ejemplos del contrato. El último muestra la etiqueta **Simulado**. Mira [Lee los resultados](/es/test/results/) y [Simulación](/es/test/simulation/).

## 5. Ejecuta Order receipt

1. Haz clic en **Order receipt** y luego en **Ejecutar**.

Los resultados muestran un bloque **Preparación**: primero se ejecutó **Create order**, porque **Order receipt** depende de él, y el recibo usó su `orderId`. Mira [Workflows que usan otros workflows](/es/design/dependencies/).

![Un workflow que depende de otro, en el lienzo](/media/es/builder-depends.webp)

## 6. Prepara el sandbox de PayPal

Para ejecutar de verdad necesitas una app del sandbox. El sandbox no mueve dinero real.

1. Entra a [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/). Abre **Apps & Credentials**, elige la pestaña **Sandbox** y haz clic en **Create App**.
2. Copia el **Client ID** y el **Secret** de la app.
3. En Luvin, abre el ambiente **Sandbox**, en **Ambientes** en la barra lateral.
4. En **Variables**, escribe el Client ID en el **Valor** de `clientId`.
5. En **Secretos**, escribe el Secret en el **Valor** de `clientSecret`.

El secret se guarda cifrado en tu computador y nunca se escribe en los archivos de la colección. Mira [URLs base, variables y secretos](/es/environments/variables-and-secrets/).

## 7. Ejecuta Create order de verdad

1. Abre **Create order** y haz clic en su pestaña **Inputs**. `amount` es `25.00` y `currency` es `USD`.
2. En la barra de ejecución, elige **API real** y el ambiente **Sandbox**.
3. Haz clic en **Ejecutar**.
4. Luvin avisa que los pasos modifican datos en **Sandbox**. Haz clic en **Ejecutar igual**.

Luvin solicita el token en la primera llamada y lo reutiliza durante el resto de la ejecución. El caso pasa cuando la orden se crea con el status `CREATED`. Si no se puede obtener el token, Luvin muestra el motivo de PayPal después de *No se pudo obtener el token:*. Revisa el Client ID y el Secret.

:::note
`PayPal-Request-Id` usa `{{$randomUUID}}`: cada ejecución crea una orden nueva. Usa un valor fijo para reintentar sin duplicados.
:::

## 8. Captura el pago

PayPal solo captura una orden que el comprador aprobó.

1. En los resultados de **Create order**, abre el paso `createOrder` y su pestaña **Outputs**. Copia `approveUrl` y `orderId`.
2. Abre `approveUrl` en un navegador y aprueba el pago con una cuenta de comprador del sandbox (**Testing Tools** → **Sandbox Accounts**, en el panel de PayPal).
3. En Luvin, abre **Capture order** y pega el `orderId` en su pestaña **Inputs**.
4. Elige **API real** y **Sandbox**, y haz clic en **Ejecutar**.

`checkOrder` encuentra la orden `APPROVED` y `capture` la captura. Si el comprador no aprobó, PayPal responde 422 (`ORDER_NOT_APPROVED`) y el workflow termina por `notApproved`. El paso del webhook sigue simulado.

## Qué aprendiste

- OAuth 2.0 se define por API en la pestaña **Autorización**, con variables para el client id y el secret.
- Luvin solicita el token, lo reutiliza y lo envía en cada paso.
- Los secretos viven en el ambiente, cifrados en tu computador, no en los archivos.
- Un workflow puede depender de otro, y los resultados lo muestran bajo **Preparación**.
- Los webhooks siempre se simulan.

## Siguiente

- [Comprueba que tu API rechaza datos malos](/es/tutorials/negative-cases/)
- [OAuth 2.0](/es/authorization/oauth2/)
- [Los ejemplos incluidos](/es/reference/examples/)
