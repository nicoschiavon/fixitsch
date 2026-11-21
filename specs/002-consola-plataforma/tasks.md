# Tareas — consola de plataforma

- [x] T1. Esquema: estados, columnas de suscripción, `payments`, alta `pending`, funciones de plataforma. RF-1, RF-3, RF-4, RF-6, RF-7.
  Hecho cuando: una base existente aplica `schema.sql` sin error y un alta nueva queda `pending`.
- [x] T2. Acceso en el servidor y guardias de escritura. RF-1, RF-2, RF-8, RF-11.
  Hecho cuando: `expired` recibe `403` al guardar y `200` al leer.
- [x] T3. Endpoints de plataforma. RF-3, RF-4, RF-6, RF-7, RF-10.
  Hecho cuando: un `workshop_owner` recibe `403` y el `admin` lista y opera sin datos sensibles.
- [x] T4. CSV de inventario del propio taller. RF-9.
  Hecho cuando: el archivo baja con BOM y solo columnas de inventario.
- [x] T5. Pantalla pendiente, consola, banner de vencido y bloqueo de escritura en la UI. RF-1, RF-2, RF-5, RF-11, RF-12.
  Hecho cuando: pendiente no renderiza el taller y vencido muestra el CSV.
- [x] T6. `TRIAL_MINUTES`, tests y `npm run lint`. RF-5.
  Hecho cuando: `npm test` y `tsc --noEmit` pasan en verde.
