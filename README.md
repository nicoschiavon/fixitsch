# FixiTsch

Sistema de gestión para talleres de reparación de celulares, tablets y notebooks. Se ofrece como suscripción: 15 días de prueba con cuenta de Google y, después, un plan pago.

El repositorio es todavía el prototipo de interfaz (Google AI Studio). Las cuentas, los pagos y la base de datos no están conectados.

## Documentos que mandan

| Archivo | Para qué |
| --- | --- |
| [CONSTITUTION.md](CONSTITUTION.md) | Reglas de producto que no se negocian |
| [MEMORY.md](MEMORY.md) | Estado real y decisiones ya tomadas |
| [AGENTS.md](AGENTS.md) | Cómo trabajar en este repo |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Una sola base, talleres aislados por `tenant_id` |
| [docs/DOMAIN.md](docs/DOMAIN.md) | Órdenes, inventario, despiece, portal |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Orden para salir del prototipo |

## Desarrollo

```bash
npm install
npm run dev
```

Abre Vite en el puerto 3000. `npm run lint` corre el chequeo de TypeScript.

## Docker Desktop

Con el motor de Docker Desktop en marcha:

```bash
docker compose up --build -d
```

La app queda en http://localhost:3001. El 3000 no se usa porque en esta máquina ya lo ocupa otro contenedor. Para ver el estado o bajarla: `docker compose ps` y `docker compose down`.

Cuenta principal local: usuario `admin`, contraseña `admin123!`. Cada cuenta nueva entra vacía. Ni otra cuenta ni admin ven esos datos. Postgres queda solo dentro de la red de Docker.

Copiar `.env.example` a `.env` solo cuando haga falta una clave. No commitear `.env`.
