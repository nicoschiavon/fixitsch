# Plan técnico — consola de plataforma

Cubre RF-1 a RF-12. Respeta la constitución: una base, `tenant_id`, RLS para el taller y funciones acotadas para la plataforma. El creador nunca recibe columnas sensibles.

## Modelo

`tenants` gana columnas de suscripción y amplía su `CHECK` de estado:

- `status`: `sandbox | pending | trial | active | expired | cancelled`.
- `trial_started_at`, `trial_ends_at`, `plan`, `current_period_end`.

`payments`: `tenant_id`, `amount_ars`, `plan`, `method`, `status`, `paid_at`. Sin `GRANT` para `fixitsch_app`; solo la tocan funciones `SECURITY DEFINER`.

`app_register` crea el tenant como `pending`.

## Acceso, calculado en el servidor

`server/access.ts`, función pura `resolveAccess({ role, status, trialEndsAt, currentPeriodEnd, now })`:

| Entrada | canRead | canWrite | canExport | Motivo |
| --- | --- | --- | --- | --- |
| `platform_owner` | sí | sí | sí | sandbox |
| `pending` | no | no | no | esperando aprobación |
| `trial` con fin futuro | sí | sí | sí | prueba |
| `trial` vencida | sí | no | sí | vencida |
| `active` con período futuro | sí | sí | sí | activa |
| `active` vencida | sí | no | sí | impaga |
| `expired` | sí | no | sí | vencida |
| `cancelled` | sí | no | sí | suspendida |

El resultado viaja como `access` en login, `/api/auth/me` y `/api/workshop`. No se guarda en `localStorage`.

## Endpoints

Taller (ya existentes, ahora con guardia):

- `GET /api/workshop`: exige `canRead`.
- `PUT /api/workshop/*`, `POST /api/workshop/clear`: exigen `canWrite`, si no `403` con el motivo.
- `GET /api/workshop/export/inventory.csv`: exige `canExport`. CSV con BOM, del tenant de la sesión.

Plataforma (solo `platform_owner`, validado en Node y otra vez en la función SQL):

- `GET /api/platform/tenants`
- `POST /api/platform/tenants/:id/trial` (`minutes` opcional, tope server-side)
- `POST /api/platform/tenants/:id/extend` (`days`)
- `POST /api/platform/tenants/:id/suspend`
- `POST /api/platform/tenants/:id/reactivate`
- `POST /api/platform/tenants/:id/payment` (`plan`, `method: transfer`)

## Interfaz

- `AuthModal` → alta. Tras el alta, `App` recibe `access.status = pending` y muestra `PendingAccessScreen` con “Probar el demo” y “Cerrar sesión”.
- La barra del `admin` suma “Plataforma”. `PlatformConsole` lista talleres y acciones. Sin columnas sensibles.
- Taller `expired` o `cancelled`: banner persistente con fecha, “Solo lectura” y “Descargar inventario (CSV)”. Nueva Orden y Guardar Configuración deshabilitados. `persist()` corta antes de la red.
- El demo y el visitante no cambian respecto de la spec 001.

## Decisiones

- Funciones `SECURITY DEFINER` con actor explícito, no un rol nuevo. Alternativa descartada: dar `SELECT` a `fixitsch_app` sobre `tenants` y filtrar en Node; eso deja la puerta abierta a un bug de filtro.
- El importe del pago se calcula en el servidor desde el plan. Alternativa descartada: mandarlo desde el formulario.
- Reactivar no crea acceso si no hay período vigente. Alternativa descartada: reactivar como `active` gratis.
- La prueba se congela al aceptarla. Cambiar `TRIAL_MINUTES` no alarga una prueba ya iniciada.

## Tests

- `server/access.test.ts`: matriz de estados, incluida la prueba vencida por fecha.
- `server/platform.test.ts`: plan → importe y días; extensión no retrocede.
- `src/utils/appShell.test.ts`: se mantiene.
- `npm run lint` para la UI.
