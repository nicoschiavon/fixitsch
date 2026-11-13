# Camino de construcción

Orden para llegar del prototipo a un servicio con cuentas. No saltear a pagos si identidad y aislamiento no existen: no hay a quién cobrarle ni qué proteger.

Cada fase termina cuando se puede demostrar el criterio, no cuando el modal lo dice.

## Fase 0 — Estructura

Hecho al crear estos archivos.

- Constitución, memoria y guía de agentes.
- Decisión de una sola base con `tenant_id`.
- Dominio escrito con los nombres que ya usa el código.

## Fase 1 — Identidad y taller vacío

- Alta e ingreso con Google real. Desaparece el selector simulado de `AuthModal` como mecanismo de acceso.
- Se crea un tenant para esa identidad, con el dueño como único miembro.
- La identidad del creador queda como `platform_owner` por configuración, no por email escrito en el modal.
- Existe un tenant sandbox del creador.
- Un segundo ingreso con la misma cuenta de Google no crea otra prueba.

Criterio: dos Google distintos no ven los mismos ajustes ni el mismo nombre de taller.

## Fase 2 — Datos del taller en la base

Migrar, por tenant, lo que hoy persiste `storage.ts`:

- ajustes
- órdenes, eventos, repuestos usados
- inventario
- donantes y piezas de despiece

La demo sin sesión sigue en memoria. Una cuenta nueva no hereda el `localStorage` del navegador.

Criterio: cerrar sesión, abrir otro navegador, entrar con Google y encontrar los datos de ese taller. Con otra cuenta, no.

## Fase 3 — Prueba de 15 días

- `trial_started_at` y `trial_ends_at` los escribe el servidor.
- Dentro del plazo, el taller escribe.
- Vencido, entra, ve y exporta. Crear, editar y borrar responden rechazo del servidor, no solo un banner.
- La UI deja de ofrecer “acceso completo bonificado”.

Criterio: alterar la fecha en el cliente no alarga la prueba.

## Fase 4 — Consola del creador

Pantalla aparte, no una pestaña más del taller.

- listado de talleres: nombre, email del dueño, estado, fin de prueba, plan, último pago
- extender prueba, suspender, reactivar, acreditar transferencia
- entrar al sandbox propio
- sin columnas de PIN, documento, IMEI ni falla del equipo

Criterio: el creador administra una suscripción sin abrir las órdenes de ese taller.

## Fase 5 — Cobro

- Checkout de Mercado Pago iniciado en el servidor.
- El webhook marca la suscripción. El modal no.
- Transferencia queda `pending` hasta que el creador la acredita en la consola.
- Período vencido pasa a `past_due` y corta la escritura.

Criterio: un pago rechazado o un cierre del modal no deja al taller en `active`.

## Fase 6 — Endurecer el taller

Solo después de tener datos reales y aislados:

- enlace de portal no adivinable
- envío real de WhatsApp o correo, y la línea de tiempo solo marca enviado cuando hubo entrega
- cifrado de códigos de desbloqueo
- export completo de los datos del taller
- miembros adicionales, si se piden

No es fase 6: rediseñar la landing ni sumar Gemini sin un uso concreto.

## Fuera de alcance hasta que se pida

- una base de datos por taller
- facturación fiscal automática
- app móvil nativa
- multi-idioma
- técnicos como usuarios con permisos finos
