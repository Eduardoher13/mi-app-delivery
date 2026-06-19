-- Listo! — políticas Storage para bucket: product_images
-- Misma lógica que Floristeria (CATALOGOFLORISTERIA): INSERT + SELECT + DELETE → public
-- Supabase → SQL Editor → pegar TODO → Run
--
-- Verificar bucket:
--   SELECT id, name, public FROM storage.buckets WHERE name = 'product_images';

DROP POLICY IF EXISTS "product_images_select" ON storage.objects;
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
DROP POLICY IF EXISTS "product_images_all" ON storage.objects;

-- SELECT — ver/listar imágenes (anon + publishable key)
CREATE POLICY "product_images_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');

-- INSERT — subir imágenes
CREATE POLICY "product_images_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'product_images');

-- UPDATE — requerido si usas upsert: true al subir
CREATE POLICY "product_images_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'product_images')
WITH CHECK (bucket_id = 'product_images');

-- DELETE — borrar imágenes (opcional, como en Floristeria)
CREATE POLICY "product_images_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'product_images');

-- Verificar:
-- SELECT policyname, cmd, roles FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
--   AND policyname LIKE 'product_images%';
