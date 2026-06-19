#!/usr/bin/env bash
# SHA-1 para restringir la API key de Google Maps (Android)
set -euo pipefail

KEYTOOL="${KEYTOOL:-/opt/homebrew/opt/openjdk@17/bin/keytool}"
KEYSTORE="${KEYSTORE:-$HOME/.android/debug.keystore}"

if [ ! -x "$KEYTOOL" ]; then
  echo "Java no encontrado. Instala con: brew install openjdk@17"
  exit 1
fi

if [ ! -f "$KEYSTORE" ]; then
  echo "Creando debug.keystore en $KEYSTORE ..."
  mkdir -p "$(dirname "$KEYSTORE")"
  "$KEYTOOL" -genkey -v \
    -keystore "$KEYSTORE" \
    -storepass android \
    -alias androiddebugkey \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US"
fi

echo ""
echo "=== Listo! — huellas para Google Cloud Console ==="
echo "Package name: com.listo.app"
echo ""
"$KEYTOOL" -list -v \
  -keystore "$KEYSTORE" \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | grep -E "SHA1:|SHA256:"
echo ""
echo "En Google Cloud → Credentials → tu API key → Android apps:"
echo "  Package: com.listo.app"
echo "  SHA-1:   (el valor SHA1 de arriba)"
echo ""
echo "Nota: builds con EAS usan otro SHA-1. Obténlo con: npx eas-cli credentials -p android"
