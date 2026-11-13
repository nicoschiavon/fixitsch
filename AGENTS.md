# FixiTsch

SaaS de gestión para talleres de reparación (celulares, tablets, notebooks), vendido por suscripción. El repo hoy es el prototipo de Google AI Studio: React en el navegador, sin backend.

## Antes de cambiar cuentas, datos o pagos

Leé, en este orden:

1. `CONSTITUTION.md` — reglas que no se negocian.
2. `MEMORY.md` — qué está simulado y qué ya se decidió.
3. `docs/ARCHITECTURE.md` — una sola base, `tenant_id`, dos planos.
4. `docs/DOMAIN.md` — lenguaje del taller. Usar estos nombres.
5. `docs/ROADMAP.md` — orden de construcción.

Si el pedido contradice la constitución, parar y preguntar. No implementar la contradicción “por mientras”.

## Comandos

```bash
npm install
npm run dev      # Vite en el puerto 3000, host 0.0.0.0
npm run lint     # tsc --noEmit
npm run build
```

No hay tests. Después de tocar TypeScript, correr `npm run lint`. No hace falta levantar el servidor de desarrollo para verificar tipos.

Para probar la build en Docker Desktop, con el motor encendido: `docker compose up --build -d`. Sirve la app en http://localhost:3001 (el 3000 queda libre para `npm run dev` y para otros proyectos). Bajarla con `docker compose down`.

El stack tiene `db` (Postgres), `migrate` (aplica `server/schema.sql`), `api` (Express en `server/`) y `web` (nginx). Logs: `docker compose logs -f api`. La cuenta principal local es `admin` / `admin123!`; se crea una sola vez al arrancar la API.

`npm run clean` usa `rm -rf` y espera un `server.js` del template de AI Studio. En Windows no es el camino normal. No hay servidor que mantener.

## Mapa del repo

```text
src/App.tsx                         estado global y modales
src/types/index.ts                  tipos del taller y de la cuenta simulada
src/utils/storage.ts                localStorage. Prototipo, no el modelo final
src/utils/helpers.ts                etiquetas de estado, dinero, fechas
src/data/initialData.ts             semilla de la demo
src/components/Orders               órdenes, ticket, detalle
src/components/Inventory            repuestos
src/components/Teardown             despiece / huesera
src/components/CustomerPortal       seguimiento del cliente
src/components/Auth                 login con usuario y contraseña
src/components/Subscription         prueba y checkout simulados
src/data/portfolioData.ts           textos de la landing del creador
server/                             API, esquema y aislamiento por tenant
```

El alias `@/*` apunta a la raíz del repo, no a `src/`. Los imports actuales usan rutas relativas. Seguir ese estilo salvo que el archivo ya use el alias.

## Convenciones

- UI en español rioplatense (voseo: “Guardá”, “Ingresá”). No pasar la interfaz a inglés ni a “usted”.
- Tipos, funciones, tablas y columnas en inglés.
- Componentes funcionales. El estado de pantalla vive en `App.tsx` hasta que exista una capa de datos real. No introducir un estado global nuevo para envolver `localStorage`.
- Tailwind 4, vía el plugin de Vite. Clases utilitarias, como el resto de la UI. Dark mode con la clase `dark` en `<html>`.
- Montos del taller: números enteros en la moneda del taller (`settings.currencySymbol`, default `$`). No formatear suscripciones de FixiTsch con esa moneda de taller: los planes son ARS de plataforma.
- No agregar dependencias sin necesidad. Express y `@google/genai` ya están y no se usan.

## Prototipo contra sistema real

Auth, prueba, checkout y `localStorage` son un simulacro. Sirven para la demo.

Al trabajar en cuentas o persistencia:

- no extender `UserAccount.planStatus = 'full_access_free_promo'`
- no crear otra clave global de `localStorage` para suscripciones
- no confirmar un pago en el cliente
- no filtrar “por usuario” solo en React y darlo por aislado

Mejoras visuales del taller (órdenes, inventario, despiece, portal, ticket) pueden seguir sobre el prototipo. Si el cambio necesita que los datos sobrevivan a otro navegador o a otra persona, corresponde al backend descripto en `docs/ARCHITECTURE.md`, no a otra clave local.

## Datos y tenencia

Una base PostgreSQL. Cada taller es un tenant. Cada fila de negocio lleva `tenant_id`. El creador administra suscripciones en el plano plataforma y prueba el producto en un sandbox, no leyendo talleres ajenos.

Los repuestos y equipos de un taller no son el catálogo de planes de FixiTsch. Unos van con `tenant_id`. El otro es de plataforma.

Detalle y motivo: `docs/ARCHITECTURE.md`.

## Verificación

- Cambio de UI o tipos: `npm run lint`.
- Cambio de copy: revisar que siga en voseo y que no prometa acceso bonificado.
- Cambio de cuentas, pagos o persistencia: tiene que poder explicarse con la constitución. Si solo funciona en `localStorage`, no está terminado.
- No commitear `.env`. Secretos solo en `.env`, nunca en semilla ni en estos markdown.

## Qué no tocar sin pedirlo

- Precios de suscripción ($30.000 / mes, $300.000 / año).
- Duración de la prueba (15 días, una por cuenta de Google).
- Datos semilla de la demo, salvo para corregir algo que la rompa.
- `vite.config.ts`: el comentario de `DISABLE_HMR` es de AI Studio. Dejarlo.
