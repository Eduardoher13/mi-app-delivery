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

import { Platform } from 'react-native';

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

/** Normaliza rutas de Supabase Storage (sin barras iniciales ni segmentos vacíos). */
export function sanitizeStoragePath(path: string): string {
  return path
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((segment) => segment.length > 0 && segment !== '.')
    .join('/');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function readImageBytesFromLegacyFs(uri: string): Promise<ArrayBuffer> {
  const FileSystem = await import('expo-file-system/legacy');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64) {
    throw new Error('La imagen seleccionada está vacía');
  }

  return base64ToArrayBuffer(base64);
}

/**
 * Lee bytes de una URI del image picker.
 * En web no usa `new File()` de expo-file-system (falla validatePath en el navegador).
 */
export async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`No se pudo leer la imagen (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error('La imagen seleccionada está vacía');
    }

    return buffer;
  }

  try {
    const response = await fetch(uri);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > 0) {
        return buffer;
      }
    }
  } catch {
    // Fallback a API legacy en iOS/Android.
  }

  return readImageBytesFromLegacyFs(uri);
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
  const storagePath = sanitizeStoragePath(options.path);

  if (!storagePath) {
    throw new Error('Ruta de archivo inválida para Storage');
  }

  const supabase = getSupabase();

  const { error } = await supabase.storage.from(bucket).upload(storagePath, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw formatStorageError(bucket, error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    publicUrl: data.publicUrl,
    path: storagePath,
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
  const path = sanitizeStoragePath(options.path ?? `${folder}/${Date.now()}.jpg`);

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
