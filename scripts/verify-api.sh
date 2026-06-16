#!/usr/bin/env bash
# Verifica que el backend NestJS responda (IP detectada automáticamente)
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

PORT="${EXPO_PUBLIC_API_PORT:-8001}"
MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)

if [ -n "${EXPO_PUBLIC_API_BASE_URL:-}" ]; then
  URL="$EXPO_PUBLIC_API_BASE_URL"
  URL_SOURCE="EXPO_PUBLIC_API_BASE_URL (.env)"
else
  URL="http://${MAC_IP:-127.0.0.1}:${PORT}"
  URL_SOURCE="auto (IP WiFi + puerto ${PORT})"
fi

echo "=== Revisión API backend ==="
echo "URL: $URL"
echo "Origen: $URL_SOURCE"
echo ""

if [ -n "$MAC_IP" ]; then
  echo "IP WiFi de esta Mac: $MAC_IP"
  if [[ "$URL" != *"$MAC_IP"* ]] && [[ -z "${EXPO_PUBLIC_API_BASE_URL:-}" ]]; then
    echo "⚠️  No se detectó en0/en1 — revisa la conexión WiFi."
  elif [[ -n "${EXPO_PUBLIC_API_BASE_URL:-}" ]] && [[ "$URL" != *"$MAC_IP"* ]]; then
    echo "⚠️  Override manual en .env no coincide con IP actual ($MAC_IP)."
    echo "   Quita EXPO_PUBLIC_API_BASE_URL del .env para usar detección automática."
  fi
  echo ""
fi

echo "Probando GET $URL/ ..."
HTTP_CODE=$(curl -s -o /tmp/casaia-api-verify.txt -w "%{http_code}" --connect-timeout 5 "$URL/" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Backend responde (HTTP $HTTP_CODE)"
  head -c 80 /tmp/casaia-api-verify.txt
  echo ""
else
  echo "❌ Backend no responde (HTTP $HTTP_CODE)"
  echo ""
  echo "Checklist:"
  echo "  1. cd casa-ia-desk && npm run start:dev"
  echo "  2. Docker/Postgres corriendo (puerto en .env del backend)"
  echo "  3. En el Honor, Chrome → $URL/ (debe decir Hello World!)"
  echo "  4. Mac y Honor en la MISMA WiFi (no datos móviles)"
  exit 1
fi

echo ""
echo "Probando GET $URL/products/active ..."
HTTP_CODE=$(curl -s -o /tmp/casaia-products.txt -w "%{http_code}" --connect-timeout 5 "$URL/products/active" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ /products/active OK"
else
  echo "❌ /products/active falló (HTTP $HTTP_CODE)"
  exit 1
fi

echo ""
echo "La app en Expo Go usa la misma IP que Metro (no hace falta poner IP en .env)."
echo "Solo define EXPO_PUBLIC_API_PORT si el backend no usa 8001."
echo "Reinicia Metro tras cambiar de red: npx expo start --clear"
