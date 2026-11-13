#!/bin/sh
set -e

attempt=0
until psql -h db -U fixitsch -d fixitsch -v ON_ERROR_STOP=1 -f /schema.sql; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "No se pudo aplicar el esquema después de $attempt intentos."
    exit 1
  fi
  echo "Postgres todavía no acepta conexiones. Reintentando..."
  sleep 2
done

echo "Esquema aplicado."
