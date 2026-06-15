#!/usr/bin/env bash
# Verifica que EXPO_PUBLIC_SUPABASE_* en .env sean válidas
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "No existe $ENV_FILE. Copia .env.example → .env"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

URL="${EXPO_PUBLIC_SUPABASE_URL:-}"
KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}"

echo "=== Revisión de formato ==="

if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "❌ Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi

if [[ "$URL" == *"TU_PROJECT_REF"* ]] || [[ "$KEY" == *"REEMPLAZA"* ]]; then
  echo "❌ Aún tienes placeholders de .env.example. Pega valores reales de Supabase."
  exit 1
fi

if [[ "$URL" != https://*.supabase.co ]]; then
  echo "❌ URL inválida: $URL"
  echo "   Debe ser: https://abcdefghijklmnop.supabase.co"
  exit 1
fi

if [[ "$KEY" != eyJ* ]] && [[ "$KEY" != sb_publishable_* ]]; then
  echo "❌ Clave inválida: usa 'Publishable key' (sb_publishable_...) o 'anon public' (eyJ...)"
  echo "   NO uses service_role en la app móvil."
  exit 1
fi

if [[ "$KEY" == eyJ* ]] && [ "${#KEY}" -lt 100 ]; then
  echo "❌ La anon key JWT parece incompleta (muy corta)."
  exit 1
fi

echo "✓ Formato URL y anon key OK"
echo ""
echo "=== Probando conexión y storage ==="

node <<'NODE'
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const BUCKET = 'product_images';
const FOLDERS = ['avatars', 'image-product'];

(async () => {
  console.log('✓ Cliente Supabase inicializado');
  console.log(`  Proyecto: ${url.replace('https://', '').replace('.supabase.co', '')}`);
  console.log(
    `  Clave: ${key.startsWith('sb_publishable_') ? 'publishable (sb_publishable_…)' : 'anon JWT (eyJ…)'}`,
  );
  console.log('');
  console.log(`Bucket requerido: ${BUCKET}`);
  console.log('  (list() NO confirma que el bucket exista — la prueba real es upload)');
  console.log('');

  console.log('Prueba de subida (INSERT — bucket debe existir + políticas RLS):');

  const testPath = `avatars/profiles/_verify/${Date.now()}.txt`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(testPath, new TextEncoder().encode('casaia-verify'), {
      contentType: 'text/plain',
      upsert: true,
    });

  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    console.log(`  ✗ upload: ${uploadError.message}`);
    console.log('');

    if (msg.includes('bucket not found')) {
      console.log('⚠️  "Bucket not found" en upload casi siempre significa:');
      console.log('   1) El bucket NO existe en ESTE proyecto de Supabase, o');
      console.log('   2) EXPO_PUBLIC_SUPABASE_URL apunta a otro proyecto distinto al del Dashboard.');
      console.log('');
      console.log('   En SQL Editor ejecuta:');
      console.log(`     SELECT id, name, public FROM storage.buckets WHERE name = '${BUCKET}';`);
      console.log('   → 0 filas = crea el bucket en Storage → New bucket → product_images (Public ON)');
      console.log('');
      console.log('   Verifica que Project Settings → Reference ID coincida con la URL de .env');
    } else if (msg.includes('row-level security') || msg.includes('policy')) {
      console.log('⚠️  El bucket existe pero RLS bloquea INSERT.');
      console.log('   Ejecuta supabase/storage-policies.sql en SQL Editor.');
    } else {
      console.log('⚠️  Revisa permisos del bucket y políticas RLS.');
    }
    process.exit(1);
  }

  console.log(`  ✓ upload ${testPath}: OK`);

  for (const folder of FOLDERS) {
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 5 });
    const icon = error ? '?' : '✓';
    const note = error ? ` (${error.message})` : ` (${data?.length ?? 0} items visibles)`;
    console.log(`  ${icon} ${folder}/${note}`);
  }

  await supabase.storage.from(BUCKET).remove([testPath]);
})();
NODE

echo ""
echo "Recuerda reiniciar Metro después de editar .env:"
echo "  npx expo start --clear"
