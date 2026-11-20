---
title: Test a payment flow with OAuth 2.0
description: Open the PayPal example, see how Luvin gets the access token by itself, run a capture in Simulation and set up the PayPal sandbox to run it for real.
sidebar:
  order: 3
---

You will explore a payment flow built on PayPal's Orders API: create an order, capture the payment, and issue a receipt. You will run it in Simulation without credentials, and then see what to change to run it against the PayPal sandbox. The first part takes about 15 minutes and needs nothing else. The second needs a free PayPal developer account.

OAuth 2.0 means the API does not accept a fixed key: it asks for an access token that you request first and that expires. Luvin requests it, reuses it and sends it with every call.

## 1. Open the PayPal example

1. On the welcome screen, click **See more examples**, at the bottom. If you opened a workspace before, click **See the examples** instead.
2. Click **Try PayPal payments**.

Luvin opens the **PayPal** collection in the **Examples** workspace. It opens in **Simulation**, because there are no credentials yet.

## 2. Look at the three workflows

In the sidebar, under the collection, there are three workflows:

| Workflow | What it does |
|---|---|
| **Create order** | Creates an order for an amount and reads it back. It returns `orderId`, `approveUrl` and `status`. |
| **Capture order** | Checks that the buyer approved the order, captures the payment and waits for the webhook that confirms it. |
| **Order receipt** | Depends on **Create order**: it uses the order id that workflow returned. |

1. Click **Create order** and open the **Design** tab.

The cards marked ♻ use *reusables*: the idempotency header `PayPal-Request-Id` and the actions for the errors 400 and 401 are written once and used in several steps. See [Reusables](/design/reusables/).

## 3. See where the token comes from

1. Click the **Authorization** tab of **Create order**.

One card shows the API `paypal`. It says **In use: OAuth 2.0 · set for every workflow**. Open it to see the fields:

| Field | Value |
|---|---|
| **Grant type** | Client Credentials |
| **Access token URL** | `https://api-m.sandbox.paypal.com/v1/oauth2/token` |
| **Client ID** | `{{clientId}}` |
| **Client Secret** | `{{clientSecret}}` |

![The Authorization tab of a workflow, with one card per API](/media/en/workflow-auth.webp)

The client id and the secret are not typed here: they are variables, `{{clientId}}` and `{{clientSecret}}`, that take their values from the active environment. The Arazzo file knows nothing about authorization. Luvin keeps this setting in `flow-auth.yaml`. See [Authorization of a workflow](/authorization/workflow/) and [OAuth 2.0](/authorization/oauth2/).

## 4. Run Capture order in Simulation

1. Click **Capture order** and open the **Inputs** tab. The input `orderId` already has an example value.
2. Open the **Cases** tab. Besides **Happy path**, Luvin generated cases by response, for example one where the `capture` step answers 422 and the workflow ends through the action `notApproved`.
3. In the run bar, check that **Simulation** is selected.
4. Click **Run**.

Next to the workflow name, a note says that one messaging step is simulated. That is the last step, `awaitCaptureEvent`: it waits for the `PAYMENT.CAPTURE.COMPLETED` webhook. Luvin does not receive PayPal events: **webhooks are always simulated**, in Simulation and against the real API.

In the results, open the **Happy path** case. The three steps `checkOrder`, `capture` and `awaitCaptureEvent` answer with the examples of the contract. The last one shows the badge **Simulated**. See [Read the results](/test/results/) and [Simulation](/test/simulation/).

## 5. Run Order receipt

1. Click **Order receipt** and click **Run**.

The results show a **Preparation** block: **Create order** ran first, because **Order receipt** depends on it, and the receipt used its `orderId`. See [Workflows that use other workflows](/design/dependencies/).

![A workflow that depends on another one, in the canvas](/media/en/builder-depends.webp)

## 6. Set up the PayPal sandbox

To run for real you need a sandbox app. The sandbox moves no real money.

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/). Open **Apps & Credentials**, choose the **Sandbox** tab and click **Create App**.
2. Copy the **Client ID** and the **Secret** of the app.
3. In Luvin, open the **Sandbox** environment, in the **Environments** panel of the sidebar.
4. In **Variables**, type the Client ID in the **Value** of `clientId`.
5. In **Secrets**, type the Secret in the **Value** of `clientSecret`.

The secret is stored encrypted on your computer and never written in the files of the collection. See [Base URLs, variables and secrets](/environments/variables-and-secrets/).

## 7. Run Create order for real

1. Open **Create order** and click its **Inputs** tab. `amount` is `25.00` and `currency` is `USD`.
2. In the run bar, choose **Real API**. At the top right of the window, choose the environment **Sandbox**.
3. Click **Run**.
4. Luvin warns that the steps modify data in **Sandbox**. Click **Run anyway**.

Luvin requests the token on the first call and reuses it for the rest of the run. The case passes when the order is created with the status `CREATED`. If the token cannot be obtained, Luvin shows the reason of PayPal after *The token couldn’t be fetched:*. Check the Client ID and the Secret.

:::note
`PayPal-Request-Id` uses `{{$randomUUID}}`: each run creates a new order. Use a fixed value to retry without duplicates.
:::

## 8. Capture the payment

PayPal only captures an order the buyer approved.

1. In the results of **Create order**, open the step `createOrder` and its **Outputs** tab. Copy `approveUrl` and `orderId`.
2. Open `approveUrl` in a browser and approve the payment with a sandbox buyer account (**Testing Tools** → **Sandbox Accounts**, in the PayPal dashboard).
3. In Luvin, open **Capture order** and paste the `orderId` in its **Inputs** tab.
4. Choose **Real API** and **Sandbox**, and click **Run**.

`checkOrder` finds the order `APPROVED` and `capture` captures it. If the buyer did not approve, PayPal answers 422 (`ORDER_NOT_APPROVED`) and the workflow ends through `notApproved`. The webhook step stays simulated.

## What you learned

- OAuth 2.0 is set per API in the **Authorization** tab, with variables for the client id and the secret.
- Luvin requests the token, reuses it and sends it in every step.
- Secrets live in the environment, encrypted on your computer, not in the files.
- A workflow can depend on another one, and the results show it under **Preparation**.
- Webhooks are always simulated.

## Next

- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [OAuth 2.0](/authorization/oauth2/)
- [The bundled examples](/reference/examples/)
