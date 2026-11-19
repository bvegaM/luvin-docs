---
title: Known limitations
description: What Luvin does not do yet.
sidebar:
  order: 4
---

These are the things Luvin does not do yet. Check them before you plan a test, so a missing feature does not surprise you.

- **Messaging steps are simulated.** Luvin does not connect to Kafka, AMQP or MQTT yet; the app says so before running.
- **CORS (browser version only).** The API under test has to allow the app's origin (see [connection help](/dev-tools/connection-help/)). Browsers cannot send cookies or the `Host` header. The desktop app has none of these restrictions.
- **Unsigned desktop installers**, tested on macOS. Windows and Linux builds have not been tried on those systems yet.
- **gRPC and NTLM only in the desktop app.** gRPC needs the `.proto` (no server reflection yet) and client-streaming and bidirectional methods send a single message.
- **No custom WebSocket headers**, in the browser or in the desktop app (both open the connection like a browser). Pass a token in the URL instead, for example `?token={{token}}`.
- **Workflow steps send payload fields, not files.** A step with a `multipart/form-data` body is sent as multipart: each payload field is a part, a list gives one part per item, and an object is sent as JSON. A step cannot attach a file. Single requests do support files and binary bodies: see [Send a file](/requests/send-files/).
- **Swagger UI for OpenAPI only.** AsyncAPI contracts use Luvin's own preview.
- **XPath 1.0.** Functions specific to XPath 2.0 or 3.0 are not available.
- **Mock servers start only in the desktop app.** A browser cannot open a port. In the browser you can still define their routes. See [Mock servers](/mocks/overview/).
- **Performance tests run from your computer.** The load comes from this machine: up to 500 virtual users and 60 minutes per test, limited by what your computer and network can send. See [Performance](/runner/performance/).
- **Performance tests measure only the real API.** In **Simulation** there is nothing to measure. To test without the API, point the environment at a mock server. For workflows, the test repeats one case per workflow: the happy path among the checked ones, or the first.
- **WebSocket requests are not part of the runner.**
- **No hosted version yet.** Run it locally, use the desktop app or serve the static build.

## Related

- [Specification support](/reference/support/)
- [Install](/get-started/install/)
