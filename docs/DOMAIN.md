# Dominio

Lenguaje del taller. Usar estos términos en UI, issues y código. No renombrar conceptos por sinónimos nuevos.

## Actores

| Término | Significado |
| --- | --- |
| Creador | Dueño de FixiTsch. Opera la plataforma. No es un taller cliente. |
| Taller | Cuenta que paga o está en prueba. También llamado tenant. |
| Dueño del taller | Persona con Google que creó la cuenta del taller. |
| Técnico | Quien diagnostica y repara. Hoy es un nombre en la orden, no un usuario. |
| Cliente del taller | Dueño del equipo. No tiene cuenta en FixiTsch. Entra al portal con un enlace de su orden. |
| Visitante | Alguien en la demo, sin cuenta. |

No llamar “usuario” a secas si puede ser el creador, el dueño del taller o el cliente del equipo. Decir cuál.

## Equipos

`smartphone`, `tablet`, `notebook`, `otro`. En la UI: celular, tablet, notebook, otro.

Datos de ingreso que el taller necesita y que son sensibles: marca, modelo, color, IMEI o serie, código o patrón de desbloqueo, estado físico, accesorios, falla denunciada.

## Orden de reparación

Número visible `ORD-####`, único dentro del taller, no en toda la plataforma.

Estados, en el orden operativo de `src/utils/helpers.ts`:

1. `ingresado` — recibido
2. `diagnostico` — el técnico evalúa
3. `presupuestado` — hay presupuesto, falta respuesta
4. `aprobado` — el cliente aceptó
5. `esperando_repuesto` — no avanza hasta tener la pieza
6. `en_reparacion`
7. `control_calidad`
8. `listo` — se avisa para retirar
9. `entregado`
10. `cancelado` — rechazado o anulado

`esperando_repuesto` no es un paso posterior a `en_reparacion`. Puede ocurrir cuando falta una pieza. No inventar estados nuevos sin actualizar helper, filtros y ticket.

Prioridad: `normal`, `alta`, `urgente`.

Presupuesto (`budgetStatus`): `sin_presupuesto`, `pendiente_aprobacion`, `aprobado`, `rechazado`. Es independiente del estado de la orden, aunque en la práctica se mueven juntos.

Dinero de una orden:

- mano de obra (`laborCost`)
- repuestos usados, cada uno con costo y precio
- descuento
- seña (`depositPaid`)
- saldo = mano de obra + repuestos − descuento − seña

Garantía en días. El default del taller está en ajustes (`defaultWarrantyDays`, semilla 90). La garantía cubre mano de obra y repuesto reemplazado, no golpes ni líquidos posteriores. Ese texto vive en `termsConditions`.

Cada cambio relevante entra en la línea de tiempo: estado, nota, autor y canal (`whatsapp`, `email`, `sistema`, `cliente`).

Checklist de control: encendido, pantalla táctil, cámaras, carga, audio y micrófono, wifi y bluetooth, botones y biometría, señal de red.

## Inventario

Repuesto stockeable. Categorías: pantalla, batería, pin de carga, teclado, cámara, placa, flex, disco o RAM, carcasa o bisagra, otros.

Origen: `nuevo` o `recuperado_despiece`. Si viene de despiece, guarda el equipo donante.

Stock mínimo dispara el aviso de reposición. Ubicación es texto libre (`Gaveta A-12`), no un mapa de depósito.

## Despiece

Equipo donante (huesera): un aparato que se desarma para recuperar piezas. Código visible `DES-###`, único por taller.

Origen: abandono del cliente, compra de lote, donación, cambio por garantía.

Estado: `disponible_despiece`, `en_proceso`, `despiezado_completo`.

Una pieza extraída entra al inventario como repuesto recuperado, con costo prorrateado y precio sugerido. No se borra del donante: queda marcada como extraída y apunta al repuesto creado.

## Ajustes del taller

Nombre, bajada, logo (imagen chica, opcional, se muestra en la barra del taller), teléfono, WhatsApp, email, dirección, ciudad, identificación fiscal, días de garantía, símbolo de moneda, condiciones, y plantillas de WhatsApp para “listo” y para presupuesto.

Esos datos salen en el ticket y en los mensajes. No son datos de la plataforma.

## Portal del cliente

El cliente consulta su orden, ve el estado y puede responder el presupuesto. No administra el taller. No ve otras órdenes, aunque adivine otro número, cuando los datos sean reales.

## Avisos

Canales: WhatsApp y correo. Hoy el prototipo arma el mensaje y registra en la línea de tiempo que “se envió”. No hay envío real. No afirmar en código nuevo que el mensaje salió si nadie lo entregó.

Plantillas con datos del taller: cliente, dispositivo, orden, saldo o total, enlace.

## Suscripción de FixiTsch

No es una orden del taller. Es el contrato entre el creador y el taller.

- Prueba: 15 días, cuenta de Google, funciones completas del taller, datos propios.
- Plan mensual: $30.000 ARS.
- Plan anual: $300.000 ARS (equivalente a 10 meses; la UI lo explica como 2 meses bonificados).
- Medios: Mercado Pago, transferencia, tarjeta a través del proveedor de pago.

El taller no configura estos precios.
