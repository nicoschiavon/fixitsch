# Memoria del proyecto

Hechos vigentes y decisiones ya tomadas. Actualizar este archivo cuando cambie el estado real del sistema o se cierre una decisión. No reescribir historia para que coincida con un cambio a medias.

Última revisión: 2026-11-12. Cuentas reales en PostgreSQL. La barra depende de la sesión.

## Origen

FixiTsch nació como prototipo en Google AI Studio. Ahora tiene API Express y PostgreSQL para cuentas. La demo sin sesión sigue en el navegador.

Dueño del producto: Nico Schiavon. Su identidad de plataforma no debe quedar hardcodeada en modales ni en datos semilla. Cuando exista auth, sale de configuración.

## Estado real del código

| Área | Estado |
| --- | --- |
| UI del taller | Funcional en el cliente: órdenes, inventario, despiece, historial, portal, ticket, ajustes, avisos. |
| Persistencia | Con sesión, PostgreSQL. Sin sesión, demo en memoria. `localStorage` ya no es la fuente de las cuentas. |
| Auth | Usuario y contraseña contra PostgreSQL. Cookie httpOnly. La cuenta `admin` / `admin123!` es la principal y no lee otros talleres. |
| Datos de taller | API en `server/`. Cada fila lleva `tenant_id` y RLS. Una cuenta nueva nace vacía. La demo sin sesión sigue en memoria. |
| Prueba de 15 días | El formulario local sigue en la UI. No crea cuentas ni corta la escritura. |
| Checkout | Simulado con `setTimeout`. Planes `mensual_30k` y `anual_300k`. Mercado Pago no está integrado. |
| Backend | `server/` + Postgres en Docker. El rol `fixitsch_app` no saltea RLS y no lee otras cuentas. |
| Gemini | Declarado en `metadata.json`. No se usa en `src/`. |
| Portfolio | `src/data/portfolioData.ts` alimenta la landing. No es el dominio del taller. |

La contradicción a recordar: la UI dice “prueba 15 días” y a la vez “acceso completo bonificado”. La regla de producto es la de `CONSTITUTION.md`. El código todavía no la cumple.

## Decisión de datos

Una sola base PostgreSQL para toda la plataforma.

- Plano plataforma: identidades, talleres, membresías, suscripciones, pagos, auditoría.
- Plano taller: órdenes, repuestos, despiece, ajustes y portal. Todas las filas llevan `tenant_id`.
- Aislamiento: Row Level Security (o el equivalente del servidor), no filtros solo en React.
- No una base por cliente. El volumen de un taller es chico y el creador necesita una consola única.
- Escape futuro: si un contrato pide infraestructura dedicada, se muda ese `tenant_id`. No se diseña multi-base ahora.

Detalle en `docs/ARCHITECTURE.md`.

## Decisiones cerradas

1. La cuenta del creador es rol de plataforma, más un taller sandbox para probar. No es un tenant con permisos extra sobre los demás.
2. La prueba dura 15 días, una por identidad de Google, con datos propios persistidos. Al vencer se corta la escritura, no el export.
3. El pago lo confirma el servidor. Mercado Pago es el canal principal. La transferencia la acredita el creador.
4. El modo demo público se mantiene: datos de muestra, sin persistencia, sin mezclarse con cuentas reales.
5. Precios vigentes: $30.000 ARS / mes y $300.000 ARS / año. No inventar otros planes.
6. Textos de UI en español rioplatense. Código y esquema en inglés.
7. Sin sesión se ve solo el inicio: logo FixiTsch, Inicio, Ingresar, Crear cuenta y Probar modo demo. El sistema se abre recién en modo demo, en memoria. El taller logueado ve en la barra el nombre y el logo de su configuración, no la landing. La cuenta principal usa esa misma barra sobre su sandbox, con la leyenda “Cuenta principal”.

## Qué no hacer en el próximo cambio

- No seguir guardando cuentas, pruebas ni pagos en `localStorage` como si fuera el sistema.
- No dar `hasPersistence: true` a cualquiera que pase por el modal de Google.
- No crear tablas sin `tenant_id` en datos de taller.
- No mostrar PIN, documento o IMEI en una futura consola de admin.
- No borrar el flujo de demo al conectar cuentas reales. Conviven.
- No tratar `portfolioData.ts` como modelo de negocio.

## Pendiente de construir

Orden recomendado, detallado en `docs/ROADMAP.md`:

1. Identidad Google + tenant + membresía, reemplazando el modal simulado.
2. Persistencia real de órdenes, inventario, despiece y ajustes, con aislamiento.
3. Prueba de 15 días aplicada en el servidor.
4. Consola del creador para suscripciones.
5. Mercado Pago y acreditación manual de transferencias.
6. Recién ahí, pulir funciones de taller que dependan de datos confiables.

Hecho: cuentas con usuario y contraseña, Postgres con RLS, alta de taller vacío y admin sin acceso a datos ajenos. Falta el panel de plataforma del creador y aplicar el corte de los 15 días.

## Preguntas abiertas

No bloquean la estructura. No asumir una respuesta.

- Proveedor concreto de Postgres: Supabase es el camino más corto (Google OAuth + RLS). No está elegido en código.
- Período de gracia visual después del vencimiento, más allá de “puede exportar y no puede editar”.
- Si un taller tendrá varios usuarios (dueño, técnico, recepción) en la primera versión paga, o solo el dueño.
- Retención y borrado a pedido. Hoy la regla es no borrar solo.
