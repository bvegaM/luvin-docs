---
title: From a Postman or Bruno collection to a tested workflow
description: Import a collection you already have, chain two saved requests into a workflow, let Luvin suggest the wiring and add a case with your own data.
sidebar:
  order: 2
---

You will turn a Postman or Bruno collection into a workflow that creates an order and reads it back, and then test it with your own data. You need about 25 minutes, Luvin open with a workspace, and a collection exported from Postman (JSON, v2.0 or v2.1) or a Bruno collection folder. It needs no OpenAPI contract.

The example uses a shop API with two requests: **Create order**, and **Get order**, whose path is `/orders/{{order_id}}`. Use your own names.

:::caution
The workflow sends the requests for real. Point the environment at a test server, not at production.
:::

## 1. Import the collection

1. Click **+** (**Create or import**) to the right of the open tabs, then **Import from Postman or Bruno**. If no workspace is open, Luvin says **Open or create a workspace to import.** Open one first.
2. For Postman, click **Choose .json files** and pick the exported collection. Pick its environment files too, to bring the variables. For Bruno, click **Choose folder** and pick the collection folder.
3. Read the summary: requests, folders, examples and environments, and how many tests became checks. Postman tests and `pm.environment.set` lines become [variables and checks](/requests/variables-and-checks/); what can't be converted, such as an `if` block, is listed in a warning.
4. Change the collection name if you want, then click **Import (N requests)**.

![The Import from Postman or Bruno dialog with a card for Postman and a card for Bruno](/media/en/import-postman.webp)

Luvin creates a new collection and opens it. Bruno does not save the value of its secrets: if your environment has some, they arrive empty. Open the environment in the **Environments** panel of the sidebar and type them. See [Import your existing work](/get-started/import/).

## 2. Open a request and send it

1. In the sidebar, open the new collection and click the request **Create order**.
2. Check the environment shown next to the request name. It must be the test one.
3. Click **Send** (or press ⌘/Ctrl + Enter).

The response appears below with its status, time and size. If it says **The request couldn’t complete**, see [Connection help](/dev-tools/connection-help/).

This also helps later: Luvin remembers the last response you received from a request. See [Single requests](/requests/overview/).

## 3. Create a workflow

1. Click **+** (**Create or import**) and choose **New Arazzo**.

Luvin creates `new.arazzo.yaml` in the collection and opens its workflow, **My workflow**, in the **Design** tab. The canvas says **Drag the first operation here**.

2. Click the name, type `Order and read it` and press Enter.

## 4. Drag the saved requests onto the canvas

1. In the **Operations** palette, open the group **Collection requests**. It lists the requests of the collection, by folder.
2. Drag **Create order** onto the canvas.
3. A dialog asks **What does the API require in «Create order»?** Tick the fields the API requires and click **Save**. The answer applies to every workflow that uses this request.
4. Drag **Get order** below **Create order**.

Each request is a step, named after it: `createOrder` and `getOrder`. A step is sent exactly like its request, with the same URL, headers and body. `getOrder` still has `{{order_id}}` written by hand in its path: Luvin does not know yet that `createOrder` returns that value. See [Build from saved requests](/design/from-requests/).

## 5. Run once so Luvin learns the responses

A saved request does not say what the API answers. Luvin learns it from the first run against the real API.

1. Open the **Cases** tab. The **Happy path** case is ticked.
2. In the run bar, choose **Real API**. At the top right of the window, choose the test environment.
3. Click **Run**.
4. Luvin warns that the steps modify data in that environment. Read the name of the environment and click **Run anyway**.

The results open at the bottom. If a step returns a list that a later step uses, the run pauses with **Run paused**: click **Continue with this item**. See [Choose an item from a list](/test/lists/).

:::tip[Learn without running]
In **Design**, click a step. If Luvin does not know its response, the panel offers **Try this step**. For a POST it asks first and you confirm with **Send anyway**.
:::

## 6. Accept the suggested wiring

1. Go back to the **Design** tab. A bar above the canvas says **Luvin found 1 connection(s) between steps**.
2. Read the line: it names the step, the value and where it would come from, for example the path of `getOrder` and the `id` of `createOrder`.
3. Click **Connect all** (or **Connect** on that line).

The step `getOrder` now takes its id from `createOrder`, with a dashed line on the canvas. Luvin connects nothing until you accept. **Undo** reverts it. Run the workflow again: `getOrder` reads the order that `createOrder` just made. See [Connect data between steps](/design/wire-data/).

## 7. Choose the data to vary

The steps keep the values of the requests, so the workflow starts with no inputs, and a case has nothing to change.

1. On the **Start** card, read **No inputs: the steps use N fixed values.** and click **Choose variable data…**.
2. In **Data to vary per case**, tick the values you want to change, for example the customer id in the body of **Create order**. Each row shows where it is and its current value.
3. Click **Turn into inputs (N)**.

Each value becomes an input that keeps its current value as the default, so the happy path does not change. Open the **Inputs** tab to see them. See [Inputs](/test/inputs/).

Now that the workflow has inputs, open **Cases**: Luvin also generates cases that send missing or invalid data. See [Cases](/test/cases/).

## 8. Add a case with your own data

1. In the **Cases** tab, in the group **Custom data cases**, click **+ New data case**.
2. In **Case name**, type `Unknown customer`.
3. In **Step to check**, choose `createOrder`.
4. In **Expected status**, type the status your API returns for an unknown customer, for example `404`.
5. Under **Case inputs**, change the customer id to a value that does not exist, for example `C-0000`.
6. Click **Add case**, then **Run**.

Custom data cases always run against the real API. If the API answers what you expected, the case ends as **Passed**, and the step that answered the error is shown as passed because it is what the case tests. If it answers something else, the case ends as **Failed** and says what was different. See [Custom data cases](/test/custom-cases/).

## What you learned

- A Postman or Bruno collection imports as a Luvin collection, without a contract.
- Saved requests become steps that Luvin sends as they are.
- The first run against the real API teaches Luvin the responses, and then it suggests the wiring. You decide.
- **Choose variable data…** turns fixed values into inputs, which unlocks generated and custom cases.

## Next

- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [Find out why a case failed](/tutorials/debug-failure/)
- [Single requests](/requests/overview/)
