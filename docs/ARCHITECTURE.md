# Arquitectura

Cómo debe quedar FixiTsch. El código actual todavía no implementa esto. `MEMORY.md` dice qué es simulacro.

## Recomendación de base de datos

Una sola base PostgreSQL, compartida por todos los talleres.

No hace falta una base por cliente, ni un archivo por cliente, ni un proyecto de Supabase por taller.

Motivo:

- Un taller maneja cientos o pocos miles de órdenes y repuestos, no un volumen que justifique aislar infraestructura.
- El creador tiene que ver todas las suscripciones en un solo lugar. Con una base por cliente, esa consola se vuelve un problema operativo.
- Backups, migraciones y deploys de decenas de bases no son viables para un solo operador.
- El aislamiento que importa es lógico: el taller A no puede leer al taller B. Eso se resuelve con `tenant_id` en cada fila y una política en la base, no con otra base.
- Si más adelante un contrato exige servidor dedicado, se exporta ese `tenant_id`. No hay que decidirlo ahora ni modelar el sistema como si ya existiera.

“Productos” no cambia la recomendación.

- Los planes de FixiTsch (mensual, anual) son filas de plataforma, pocas y compartidas.
- Los productos del taller (repuestos, equipos donantes, órdenes) son filas del tenant. Viven en las mismas tablas, separados por `tenant_id`.

## Dos planos

```text
Plataforma                          Taller (tenant)
-----------------------------       ---------------------------------
identidades Google                  ajustes del taller
rol del creador                     órdenes y su historial
talleres y su estado                repuestos usados en la orden
membresías                          inventario
suscripciones y pagos               equipos donantes y piezas
auditoría                           portal del cliente de ese taller
```

El creador no es un taller con un permiso especial sobre los demás. Tiene:

- consola de plataforma para pruebas, pagos, altas y suspensiones
- un tenant sandbox, marcado como tal, para usar el producto como lo usaría un taller

Entrar a los datos de un cliente solo ocurre en una sesión de soporte explícita, con motivo, y queda en `audit_log`. Esa sesión no es el camino para “probar el sistema”.

## Identidad

Proveedor: Google. El identificador estable es el `sub` de Google, no el email. El email puede cambiar.

```text
Identity
  id
  provider            google
  provider_subject    sub de Google
  email
  name
  avatar_url
  created_at

PlatformRole
  identity_id
  role                platform_owner
```

Una identidad tiene como máximo una prueba histórica. Crear otro taller con la misma cuenta de Google no reinicia los 15 días.

En la primera versión, el taller tiene un miembro: el dueño. El esquema igual guarda membresía, para no clavar “el usuario es el taller”.

```text
Membership
  tenant_id
  identity_id
  role                owner | technician | receptionist
```

`technician` y `receptionist` no se construyen hasta que se pidan. La tabla sí existe desde el principio.

## Tenant y suscripción

```text
Tenant
  id
  workshop_name
  status              trial | active | past_due | expired | cancelled | sandbox
  trial_started_at
  trial_ends_at
  owner_identity_id
  created_at

Subscription
  id
  tenant_id
  plan                monthly | yearly
  status              pending | active | past_due | cancelled
  current_period_start
  current_period_end
  provider            mercadopago | manual_transfer
  external_id

Payment
  id
  tenant_id
  subscription_id
  amount_ars
  method              mercadopago | transfer | card
  status              pending | approved | rejected
  paid_at
  raw_event           payload del proveedor, no se muestra en UI
```

Estados de acceso, evaluados en el servidor:

| Estado | Escribir | Leer y exportar |
| --- | --- | --- |
| `trial` dentro de los 15 días | sí | sí |
| `active` | sí | sí |
| `past_due`, `expired`, `cancelled` | no | sí |
| `sandbox` | sí, solo ese tenant | sí |
| demo sin cuenta | solo en memoria | no hay cuenta que exportar |

Los precios no se copian a cada taller como fuente de verdad. El plan apunta al catálogo de plataforma:

- `monthly`: 30000 ARS
- `yearly`: 300000 ARS

## Datos del taller

Todas estas tablas llevan `tenant_id` NOT NULL. No hay fila “global” de órdenes ni de repuestos.

Traducción desde los tipos actuales de `src/types/index.ts`:

| Tipo actual | Tabla | Notas |
| --- | --- | --- |
| `WorkshopSettings` | `workshop_settings` | una fila por tenant |
| `RepairOrder` | `repair_orders` | el número visible (`ORD-1042`) es único por tenant, no global |
| `TimelineEntry` | `order_events` | |
| `PartUsage` | `order_part_usages` | |
| `InventoryPart` | `inventory_parts` | el “producto” del taller |
| `DonorDevice` | `donor_devices` | |
| `SalvagePart` | `salvage_parts` | |
| `TrialAccount` | no se migra | queda reemplazado por `Tenant` + `Subscription` |
| `UserAccount` | no se migra | queda reemplazado por `Identity` + `Membership` |

El portal del cliente no es una cuenta de FixiTsch. Es una vista de una orden de un tenant, con un token opaco por orden. El token no es el número de orden: `?order=ORD-1042` en el prototipo es adivinable y no sirve cuando haya datos reales.

`passcode`, documento e IMEI son columnas sensibles. No entran en listados de plataforma ni en logs.

## Aislamiento

Cada request de taller fija el tenant desde la sesión (la membresía), nunca desde un id enviado por el cliente sin verificar.

En PostgreSQL, Row Level Security en cada tabla de taller:

- un miembro solo lee y escribe filas de sus tenants
- el rol de aplicación no es dueño de la tabla y no saltea RLS
- el rol de plataforma, usado por la consola, no tiene política de lectura sobre órdenes, repuestos, PIN ni documentos
- la sesión de soporte usa un rol aparte, acotado, y escribe `audit_log` antes de leer

El frontend puede filtrar para la UI. Eso no cuenta como seguridad.

## Demo

El visitante sin sesión sigue viendo `initialData` en memoria. Esos datos no se insertan en la base al abrir la landing. Si el visitante crea una cuenta, el taller nuevo empieza vacío (o con una semilla opcional marcada como ejemplo y borrable). No se copia el `localStorage` de la demo a la cuenta: ese almacenamiento es por navegador y no es confiable.

## Dónde corre cada cosa

Objetivo, no el estado actual:

```text
Navegador     React + Vite. No decide acceso ni pago.
API           sesión, tenant, reglas de prueba y suscripción
Postgres      datos y RLS
Mercado Pago  webhook hacia la API. El modal solo inicia el checkout.
Consola       mismas APIs de plataforma, otra UI, solo platform_owner
```

Camino de implementación recomendado, todavía no elegido en código: Supabase (Postgres, Auth con Google y RLS) más un endpoint propio para el webhook de Mercado Pago. Sirve porque el aislamiento queda en la base aunque el cliente esté mal. Un Postgres propio con la misma forma de tablas también cumple la constitución. No hace falta decidir el proveedor para respetar el modelo.

Gemini, si se usa, va del lado servidor. No hay una función de producto que lo requiera todavía. No agregarlo “porque el template lo declara”.

## Qué se borra del diseño actual

Cuando exista el backend, dejan de ser fuente de verdad:

- `fixitsch_current_user_v2`
- `fixitsch_users_list_v2`
- `fixitsch_data_user_*`
- `fixitsch_trial_account_v2`
- el alta que setea `hasPersistence: true` y `full_access_free_promo`

Pueden quedar un tiempo como caché de UI. No se leen para autorizar.
