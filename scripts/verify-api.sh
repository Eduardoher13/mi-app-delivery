#!/usr/bin/env bash
# Verifica que el backend NestJS responda en EXPO_PUBLIC_API_BASE_URL
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "No existe $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

URL="${EXPO_PUBLIC_API_BASE_URL:-}"

echo "=== Revisión API backend ==="

if [ -z "$URL" ]; then
  echo "❌ Falta EXPO_PUBLIC_API_BASE_URL en .env"
  exit 1
fi

if [[ "$URL" == *"localhost"* ]] || [[ "$URL" == *"127.0.0.1"* ]]; then
  echo "⚠️  $URL usa localhost — en celular físico (Honor) NO funcionará."
  echo "   Usa la IP LAN de tu Mac, ej: http://192.168.1.74:8001"
fi

echo "URL configurada: $URL"
echo ""

MAC_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [ -n "$MAC_IP" ]; then
  echo "IP WiFi de esta Mac: $MAC_IP"
  if [[ "$URL" != *"$MAC_IP"* ]]; then
    echo "⚠️  La URL no contiene $MAC_IP — verifica que sea la IP actual."
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
echo "En el Honor abre Chrome y prueba: $URL/"
echo "Luego reinicia Expo: npx expo start --clear"
