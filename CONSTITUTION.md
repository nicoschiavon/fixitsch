# Constitución de FixiTsch

Principios que no se negocian al implementar. Si una tarea contradice este archivo, se detiene y se pregunta. No se “arregla” violando una regla para terminar más rápido.

Este archivo solo cambia cuando el creador lo pide de forma explícita.

## 1. Qué es el producto

FixiTsch es un SaaS de gestión para talleres de reparación de celulares, tablets y notebooks. Se vende por suscripción. No es una demo permanente ni un acceso bonificado.

El taller usa el sistema para:

- recibir equipos y seguir órdenes de reparación
- presupuestar, cobrar seña y registrar repuestos usados
- controlar inventario y recuperar piezas por despiece
- avisar al cliente (WhatsApp / correo) y ofrecerle un portal de seguimiento
- imprimir la orden / ticket del taller

La landing y el modo demo sirven para mostrar el producto. No son el producto.

## 2. Dos planos, nunca mezclados

Hay dos planos distintos. No se modelan como “un usuario con un flag”.

### Plano plataforma

Lo opera el creador (Nico Schiavon), dueño del servicio.

Puede:

- ver y administrar suscripciones, pruebas, pagos y estado de cada cuenta
- extender una prueba, marcar un pago manual, suspender o reactivar una cuenta
- entrar al producto en un taller sandbox propio para probar y mejorar el servicio
- usar una sesión de soporte explícita, auditada, si un taller pide ayuda

No puede, en el uso normal:

- leer datos de clientes de otros talleres (nombre, teléfono, documento, IMEI, PIN, notas)
- mezclar su sandbox con datos reales de clientes
- borrar datos de un taller sin una acción explícita y registrada

### Plano taller (tenant)

Cada cuenta de usuario es un taller. El taller es el dueño de sus datos: órdenes, clientes, inventario, despiece, ajustes y plantillas.

Un taller no ve, no exporta y no referencia datos de otro taller. Ni por ID adivinado, ni por búsqueda, ni por un bug de filtro en el cliente.

## 3. Cuentas y acceso

Identidad vigente, pedida por el creador: usuario y contraseña. Una cuenta es un taller. La cuenta principal es `admin`, rol de plataforma, y no tiene una vía para leer datos de otros talleres. Google y el corte de la prueba a los 15 días quedan para después; mientras tanto una cuenta creada puede escribir solo en su taller.

| Quién | Cómo entra | Qué obtiene |
| --- | --- | --- |
| Visitante | Sin cuenta | Demo con datos de muestra. Nada se persiste. |
| Taller | Usuario y contraseña | Nace vacío. Solo ve y edita sus datos. |
| Creador (`admin`) | Usuario y contraseña | Su propio sandbox, vacío al nacer. No ve los datos de otros talleres. |

Reglas de la prueba:

- Dura 15 días corridos desde el alta con Google.
- No se reinicia creando otra cuenta, otro navegador u otro nombre de taller con la misma identidad de Google.
- Durante la prueba el taller usa el sistema de verdad, con sus datos. La limitación es el tiempo, no un modo capado.
- Al vencer, puede entrar, ver y exportar sus datos. No puede crear ni editar hasta pagar.
- Los datos vencidos no se borran solos. El borrado es un pedido explícito o una política que el creador defina después.

Reglas de la suscripción:

- Sin pago confirmado por el servidor no hay acceso completo.
- El cliente nunca es la fuente de verdad del pago. Un modal que dice “pago exitoso” no activa nada.
- Planes vigentes hasta que el creador los cambie: mensual $30.000 ARS y anual $300.000 ARS.
- Medios previstos: Mercado Pago y transferencia. La transferencia la confirma el creador en la consola.
- Impago: se bloquea la escritura. No se borran los datos para cobrar.

El acceso “completo bonificado” del prototipo no es una regla de producto. No se extiende ni se copia a código nuevo.

## 4. Aislamiento de datos

Decisión cerrada: una sola base de datos, no una base por taller.

Cada fila de negocio lleva `tenant_id`. El aislamiento lo garantiza la base (Row Level Security o equivalente en el servidor), no un `if` en React ni una clave de `localStorage`.

No se crea una base, un schema o un archivo por cliente para “separar mejor”. Eso se reconsidera solo si un contrato futuro exige infraestructura dedicada. El modelo ya debe permitir ese escape: toda fila de negocio tiene `tenant_id`.

El catálogo de planes de FixiTsch es de la plataforma y es compartido. Los repuestos, equipos y órdenes son del taller y van siempre con su `tenant_id`.

## 5. Privacidad

Los talleres cargan datos de terceros y secretos del equipo (PIN, patrón, IMEI, documento).

- Esos campos no se loguean, no van en analytics y no aparecen en listados de la consola de plataforma.
- Cuando exista backend, los códigos de desbloqueo se guardan cifrados. No viajan en URLs.
- Un backup o export de un taller contiene solo los datos de ese taller.
- El modo demo usa datos ficticios. No se siembran datos reales de clientes en el repositorio.

## 6. Qué cuenta como hecho

Hoy el repositorio es un prototipo de interfaz creado en Google AI Studio. Auth, prueba, checkout y persistencia son simulados en el navegador.

Está prohibido presentar o extender esa simulación como si fuera el sistema de cuentas. Trabajo nuevo de cuentas, pagos o datos vive en el servidor, con el modelo de esta constitución.

Se puede seguir mejorando la interfaz del taller sobre el prototipo. No se puede apoyar en ella una regla de seguridad.

## 7. Idioma y dinero

- Textos de interfaz: español rioplatense, con voseo, como el resto de la app.
- Identificadores de código, tablas y tipos: inglés.
- Montos de taller: la moneda la define el taller. El default actual es ARS (`$`).
- Precios de la suscripción de FixiTsch: ARS, definidos por la plataforma, no por cada taller.

## 8. Cómo se cambia esto

Una tarea, un agente o una conveniencia de implementación no enmiendan esta constitución. Si hace falta una excepción, se pregunta al creador y, si acepta, se edita este archivo en el mismo cambio que la excepción.
