# Plan técnico — barra según sesión

Cubre RF-1 a RF-11. No toca precios, prueba de 15 días ni aislamiento: el logo viaja dentro de `workshop_settings.data`, que ya tiene `tenant_id` y RLS.

## Archivos

| Archivo | Responsabilidad | RF |
| --- | --- | --- |
| `src/utils/appShell.ts` | Modo de pantalla puro: público, demo, cuenta, portal. | RF-1, RF-3, RF-4, RF-6, RF-10 |
| `src/utils/logo.ts` | Validar el data URL del logo en el cliente. | RF-7, RF-8 |
| `src/components/Navbar.tsx` | Pintar la barra según el modo. | RF-2, RF-3, RF-5, RF-6, RF-7, RF-11 |
| `src/App.tsx` | Estado `demoActive`, entradas, salida, pie y guardia de render. | RF-1, RF-4, RF-5, RF-9, RF-10 |
| `src/components/Settings/SettingsModal.tsx` | Elegir, previsualizar y quitar el logo. | RF-7, RF-8 |
| `src/components/Landing/LandingPage.tsx` | Los accesos del inicio abren la demo, no el taller real. | RF-4 |
| `src/components/CustomerPortal/CustomerPortalView.tsx` | Texto del botón de vuelta según quién mira. | RF-10 |
| `src/types/index.ts` | `logoDataUrl` opcional en ajustes. | RF-7 |
| `server/settings.ts` | Sanitizar el logo al guardar. | RF-8 |
| `server/index.ts` | Rechazar un logo inválido en `asSettings`. | RF-8 |

## Lógica pura

`resolveShellMode({ hasAccount, demoActive, hasPortalQuery })`:

1. Si hay cuenta → `account` (la demo no pisa la sesión).
2. Si no, y la demo está abierta → `demo`.
3. Si no, y hay `?order=` → `portal`.
4. Si no → `public`.

`visibleSection(mode, tab)`:

- `public` → solo inicio, aunque el tab interno diga otra cosa.
- `portal` → solo seguimiento.
- `demo` o `account` → el tab del taller; `landing` se lee como Órdenes.

El logo válido es `data:image/(png|jpeg|webp|gif);base64,...`, sin espacios, hasta 180.000 caracteres. Vacío significa “sin logo”. Cualquier otro string no vacío se rechaza. SVG y `javascript:` no pasan.

## Interfaz

- Público: wordmark FixiTsch, Inicio, Ingresar, Crear cuenta, Probar modo demo. Sin tema, sin engranaje, sin Nueva Orden. En móvil, la misma lista en una tira con scroll.
- Demo: wordmark FixiTsch + “Modo demo”, módulos del taller, tema, engranaje, Nueva Orden, Salir. Ingresar y Crear cuenta quedan en la franja ámbar, que ya existe.
- Cuenta: iniciales o imagen, nombre de `settings.workshopName`, módulos, tema, engranaje, Nueva Orden, cerrar sesión. La cuenta principal agrega “Cuenta principal” bajo el nombre.
- Portal público: wordmark, “Seguimiento”, Volver al inicio. Sin herramientas del taller.

## Decisiones

- El logo se guarda en el JSON de ajustes, no en una tabla nueva ni en `localStorage`. Alternativa descartada: endpoint de archivos. No hay almacenamiento de objetos y el límite es chico.
- La demo no persiste. Salir restablece la semilla en memoria. Alternativa descartada: seguir usando la ausencia de usuario como “ya estoy en la demo”.
- `admin` usa la barra del sandbox. Alternativa descartada: dejarle la barra vieja, que sigue mezclando la landing con el taller. La consola de plataforma no existe todavía.
- Tests con `node:test` vía `tsx`, sin dependencia nueva. La UI se verifica con `tsc`. No hay Chrome DevTools en este entorno.

## Tests

- `src/utils/appShell.test.ts`: los cuatro modos y la sección visible.
- `server/settings.test.ts`: logo vacío, válido, SVG, `javascript:`, demasiado largo.
