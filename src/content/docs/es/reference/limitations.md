---
title: Limitaciones conocidas
description: Lo que Luvin todavía no hace.
sidebar:
  order: 4
---

Esto es lo que Luvin todavía no hace. Revísalo antes de planificar una prueba, para que una función que falta no te sorprenda.

- **Los pasos de mensajería se simulan.** Luvin todavía no se conecta a Kafka, AMQP ni MQTT; la app lo avisa antes de ejecutar.
- **CORS (solo en la versión de navegador).** La API que pruebas tiene que permitir el origen de la app (mira la [ayuda de conexión](/es/dev-tools/connection-help/)). Los navegadores no pueden enviar cookies ni la cabecera `Host`. La app de escritorio no tiene estas restricciones.
- **Instaladores de escritorio sin firmar**, probados en macOS. Los de Windows y Linux aún no se han probado en esos sistemas.
- **gRPC y NTLM solo en la app de escritorio.** gRPC necesita el `.proto` (todavía sin server reflection) y los métodos de client-streaming y bidireccionales envían un solo mensaje.
- **Sin cabeceras propias en WebSocket**, ni en el navegador ni en la app de escritorio (las dos abren la conexión como un navegador). Pasa el token en la URL, por ejemplo `?token={{token}}`.
- **Los pasos de un workflow envían campos del payload, no archivos.** Un paso con un body `multipart/form-data` se envía como multipart: cada campo del payload es una parte, una lista da una parte por elemento y un objeto se envía como JSON. Un paso no puede adjuntar un archivo. Los requests sueltos sí admiten archivos y bodies binarios: mira [Envía un archivo](/es/requests/send-files/).
- **Swagger UI solo para OpenAPI.** Los contratos AsyncAPI usan la vista previa propia de Luvin.
- **XPath 1.0.** Las funciones propias de XPath 2.0 o 3.0 no están disponibles.
- **Todavía no hay versión alojada.** Ejecútalo en local, usa la app de escritorio o publica la compilación estática.

## Relacionado

- [Soporte de especificaciones](/es/reference/support/)
- [Instalar](/es/get-started/install/)
