# Consola de plataforma y acceso por suscripción

Estado: aprobada para implementar (el pedido incluye desarrollar la consola y el bloqueo).

## Por qué

Hoy una cuenta recién creada entra directo a un taller vacío, sin que nadie apruebe nada, y nada la corta a los 15 días. El creador no tiene dónde ver ni administrar suscripciones. La barra ya distingue visitante, demo y taller, pero el acceso al taller no depende del estado de la cuenta.

## Actores

- Creador (`admin`, `platform_owner`): administra suscripciones. No lee datos de clientes de otros talleres.
- Taller (`workshop_owner`): dueño de una cuenta. Su taller nace pendiente.
- Visitante y demo: como en la spec 001.

## Requisitos

RF-1. Cuando una cuenta se registra, el taller queda `pending`. No entra al taller real: ve una pantalla de espera con la opción de usar el demo.

RF-2. La pantalla de espera no muestra órdenes, inventario, despiece, portal, configuración ni Nueva Orden del taller. El servidor tampoco entrega `/api/workshop` para una cuenta `pending`.

RF-3. La cuenta principal ve una consola de plataforma con el listado de talleres: nombre, usuario y nombre del dueño, estado, inicio y fin de prueba, plan, fin del período y último pago aprobado. No incluye PIN, documento, IMEI, falla ni datos de clientes.

RF-4. Desde la consola, el creador puede aceptar la prueba de un taller `pending`. Eso fija `trial_started_at` y `trial_ends_at` en el servidor y le da acceso de escritura mientras dure.

RF-5. La duración de la prueba se configura en el servidor. El valor por defecto es 15 días. Un valor de prueba permite acortarla a minutos sin cambiar el producto.

RF-6. El creador puede extender una prueba, suspender un taller y reactivarlo. Reactivar no regala acceso: si el período o la prueba ya vencieron, el taller queda en solo lectura hasta que haya un pago.

RF-7. El creador puede registrar un pago por transferencia. El importe y el fin del período los calcula el servidor desde el plan (`monthly` = 30.000 ARS, 30 días; `yearly` = 300.000 ARS, 365 días). El cliente no manda el importe.

RF-8. Cuando la prueba vence (o el período pago vence), el taller queda en solo lectura: puede entrar, ver órdenes, inventario, despiece y portal, pero el servidor rechaza cualquier creación, edición o borrado.

RF-9. En solo lectura, el taller puede descargar su inventario en CSV desde el sistema. El CSV es del propio taller, no del creador. No incluye datos de clientes.

RF-10. El creador no puede suspender, extender ni cobrar su propio sandbox.

RF-11. La barra y la pantalla reflejan el estado: pendiente, prueba con fecha de fin, activo, o vencido con el aviso de solo lectura y la descarga CSV. La UI no es la que autoriza: el servidor rechaza igual.

RF-12. El demo sigue disponible en todos los estados. Una cuenta pendiente o vencida no pierde el acceso al demo.

## Fuera de esta versión

- Mercado Pago y webhook.
- Cobro con tarjeta.
- Consola con métricas de uso, facturación fiscal o export de datos de clientes.
- Sesión de soporte auditada dentro de un taller ajeno.

## Decisiones tomadas al cerrar ambigüedades

- La prueba arranca cuando el creador la acepta, no en el alta. Es el cambio pedido sobre la regla anterior.
- `expired` y `cancelled` son solo lectura, no borrado. Los datos no se tocan.
- El CSV es de inventario porque es lo pedido. Exportar órdenes o clientes queda para otra spec.
- “5 minutos” se resuelve con `TRIAL_MINUTES` en el servidor, no cambiando la regla de producto.
