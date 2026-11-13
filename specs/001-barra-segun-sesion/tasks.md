# Tareas — barra según sesión

- [x] T1. Lógica de modo y logo, con tests. RF-1, RF-4, RF-6, RF-8, RF-10.
  Hecho cuando: `npx tsx --test` pasa y un visitante sin demo no resuelve a un módulo del taller.
- [x] T2. Barra pública, de demo y de cuenta. RF-2, RF-3, RF-5, RF-6, RF-7, RF-11.
  Hecho cuando: cada modo pinta solo los controles de la spec, en escritorio y en la tira móvil.
- [x] T3. Estado en `App` (entrar, salir, pie, `?order=`, logout). RF-1, RF-4, RF-5, RF-9, RF-10.
  Hecho cuando: sin sesión no se renderiza el taller, y cerrar sesión vuelve al inicio.
- [x] T4. Logo en configuración y sanitizado en el servidor. RF-7, RF-8.
  Hecho cuando: un logo válido queda en los ajustes y uno inválido no se guarda.
- [x] T5. `npm run lint` y tests en verde. Memoria del proyecto actualizada.
  Hecho cuando: `tsc --noEmit` no reporta errores.
