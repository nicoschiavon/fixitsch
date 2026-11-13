# Barra según sesión

Estado: aprobada para implementar (el pedido incluye captar, planificar y ejecutar).

## Por qué

Hoy la barra mezcla la landing con el taller. Un visitante sin cuenta ve Órdenes, Inventario, Despiece, Historial, Portal, configuración y Nueva Orden como si ya hubiera entrado al sistema. El taller logueado, a su vez, sigue mostrando la marca FixiTsch y no la identidad de su negocio.

## Actores

- Visitante: sin sesión y sin haber abierto la demo.
- Demo: sin sesión, después de elegir probar el sistema.
- Taller: sesión de una cuenta que no es la principal de plataforma.
- Cuenta principal (`admin`): sesión de plataforma, con su sandbox. No lee otros talleres.
- Cliente del equipo: llega con `?order=`, sin cuenta de FixiTsch.

## Requisitos

RF-1. Cuando no hay sesión y la demo no está abierta, la página muestra solo el inicio.

RF-2. En ese estado, la barra muestra únicamente el logo y el nombre FixiTsch, Inicio, Ingresar, Crear cuenta y Probar modo demo.

RF-3. En ese estado, la barra no muestra Órdenes, Inventario, Despiece, Historial, Portal Clientes, cambio de tema, configuración ni Nueva Orden. El pie tampoco abre el taller.

RF-4. Cuando el visitante elige Probar modo demo (desde la barra o desde un acceso equivalente del inicio), entra al sistema de demostración, en memoria, con los datos de muestra. Nada de esa sesión se escribe en una cuenta.

RF-5. En la demo se puede usar Órdenes, Inventario, Despiece, Historial, Portal Clientes, el tema, la configuración y Nueva Orden. Hay una salida explícita que vuelve al inicio público y descarta los cambios de esa demo.

RF-6. Cuando hay sesión de taller (no admin), la barra muestra el nombre del taller y su logo, Órdenes, Inventario, Despiece, Historial, Portal Clientes, el cambio de tema, el engranaje de configuración y Nueva Orden. No muestra la landing ni los accesos de visitante (Inicio comercial, Ingresar, Crear cuenta, Probar modo demo).

RF-7. El nombre y el logo salen de la configuración del taller. Cambiarlos ahí y guardar actualiza la barra. Sin logo, se muestran las iniciales del nombre.

RF-8. El logo es una imagen chica (PNG, JPG, WebP o GIF, hasta 120 KB). Un archivo que no cumple eso no se guarda. No se acepta SVG ni una URL arbitraria.

RF-9. Cerrar sesión vuelve al inicio público. No abre la demo ni muestra datos del taller que se acaba de cerrar.

RF-10. Un enlace `?order=` sin sesión abre solo el seguimiento de esa orden de demostración, sin la barra del taller. Volver al inicio sale de ese seguimiento. No lee datos de otro tenant.

RF-11. La cuenta principal, mientras no exista la consola de plataforma, usa la misma barra operativa que un taller, con el nombre y el logo de su sandbox y la leyenda "Cuenta principal". No ve datos de otros talleres.

## Fuera de esta versión

- Consola de plataforma.
- Portal con token opaco.
- Subir el logo a un almacenamiento distinto de los ajustes del taller.
- Cambiar precios, duración de la prueba o el alta simulada de los 15 días.

## Decisiones de producto tomadas al cerrar ambigüedades

- "Login" se muestra como "Ingresar": la interfaz no pasa a inglés.
- La demo no usa el nombre del taller del visitante en la barra: sigue siendo la marca FixiTsch, con la leyenda "Modo demo".
- Cerrar sesión no es "volver a modo demo".
