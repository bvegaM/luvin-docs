---
title: Privacy and security
description: Where your data lives, how secrets are kept and what the desktop app can and cannot reach.
sidebar:
  order: 5
---

Luvin runs on your machine. This page says where each kind of data lives and what protects it.

- Everything runs **on your machine**, in the browser or the desktop app. There is no backend and no account.
- **Secrets never go into the workspace files.** Environment files only keep secret names. Values are stored **encrypted on this computer**: with the operating system's keychain in the desktop app, and with WebCrypto in the browser.
- Tokens, passwords and API keys are **masked** in results, reports, exports, Dev Tools and every cURL.
- The desktop app only reads and writes inside folders you chose, and its interface has no direct access to the file system. The terminal opens your own shell, only in a workspace folder or your home folder.
- Without a workspace, the saved session leaves out credentials and any input whose name looks sensitive (`token`, `password`, `secret`…).

## Where each kind of data lives

| Data | Where | In the files? |
|---|---|---|
| Contracts, Arazzo files, cases, requests | The workspace folder (or this browser, for a workspace saved in the browser). | Yes. |
| Names of secrets, base URLs, variables | `environments/*.yaml`. | Yes. |
| Values of secrets and credentials | Encrypted on this computer. | No. |
| The session without a workspace | The storage of the browser or the app, on this computer. | No. |
| Preferences such as theme, interface and panel sizes | This computer. | No. |
| The Console and the Network lists | Memory. They disappear when you close the app. | No. |

If the operating system keychain is not available, the desktop app does not store secret values, rather than store them in the open. You type them again.

## What you should still watch

:::caution[Inputs are written as you type them]
The values you type in **Inputs** and in the cases are saved in the `scenarios/` files of the workspace, as written. Do not put a real password there. Use a secret and write `{{clientSecret}}`.
:::

:::tip[Sharing a workspace]
Because secret values are not in the files, you can commit a workspace to git. Each person adds their own secrets on their computer. See [Keep a workspace in git](/workspaces/git/).
:::

## Related

- [Base URLs, variables and secrets](/environments/variables-and-secrets/)
- [What is on disk](/workspaces/files/)
- [Use Luvin without a workspace](/workspaces/without-workspace/)
