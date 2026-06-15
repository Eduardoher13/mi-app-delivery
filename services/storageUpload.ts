import {
  getSupabase,
  getSupabaseStatus,
  isSupabaseConfigured,
  resolveSupabaseConfigForDebug,
} from './supabase';
import {
  SUPABASE_FOLDER_AVATARS,
  SUPABASE_STORAGE_BUCKET,
} from '../utils/constants';

export interface StorageUploadResult {
  publicUrl: string;
  path: string;
  bucket: string;
}

/** Lee bytes de una URI local del image picker (más fiable que fetch(uri) en RN). */
export async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  const { File } = await import('expo-file-system');
  const file = new File(uri);
  const buffer = await file.arrayBuffer();

  if (buffer.byteLength === 0) {
    throw new Error('La imagen seleccionada está vacía');
  }

  return buffer;
}

export async function uploadToStorage(
  bytes: ArrayBuffer,
  options: {
    bucket?: string;
    path: string;
    contentType?: string;
  },
): Promise<StorageUploadResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase no configurado en la app. Reinicia Metro: npx expo start --clear',
    );
  }

  const bucket = options.bucket ?? SUPABASE_STORAGE_BUCKET;
  const contentType = options.contentType ?? 'image/jpeg';
  const supabase = getSupabase();

  const { error } = await supabase.storage.from(bucket).upload(options.path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw formatStorageError(bucket, error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(options.path);

  return {
    publicUrl: data.publicUrl,
    path: options.path,
    bucket,
  };
}

export async function uploadImageUri(
  uri: string,
  options: {
    bucket?: string;
    folder?: string;
    path?: string;
  } = {},
): Promise<StorageUploadResult> {
  const bucket = options.bucket ?? SUPABASE_STORAGE_BUCKET;
  const folder = options.folder ?? 'uploads';
  const path = options.path ?? `${folder}/${Date.now()}.jpg`;

  const bytes = await readImageBytes(uri);
  return uploadToStorage(bytes, { bucket, path });
}

/** Misma prueba que npm run verify:supabase, ejecutable desde la app. */
export async function testStorageConnection(): Promise<StorageUploadResult> {
  const path = `${SUPABASE_FOLDER_AVATARS}/profiles/_verify/${Date.now()}.txt`;
  const bytes = new TextEncoder().encode('casaia-app-verify').buffer;

  const result = await uploadToStorage(bytes, {
    path,
    contentType: 'text/plain',
  });

  const supabase = getSupabase();
  await supabase.storage.from(result.bucket).remove([path]);

  return result;
}

function formatStorageError(bucket: string, rawMessage: string): Error {
  const msg = rawMessage.toLowerCase();
  const status = getSupabaseStatus();
  const debug = resolveSupabaseConfigForDebug();

  if (msg.includes('bucket not found')) {
    return new Error(
      `Bucket "${bucket}" no accesible. App usa proyecto "${status.projectRef ?? '?'}". ` +
        `URL en app: ${debug.urlPreview}. ` +
        'Si verify:supabase OK pero esto falla, reinicia con npx expo start --clear.',
    );
  }

  if (msg.includes('row-level security') || msg.includes('policy')) {
    return new Error(
      `Sin permiso INSERT en "${bucket}". Revisa políticas en Supabase Storage.`,
    );
  }

  return new Error(rawMessage);
}
