import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { isSupabaseConfigured } from '../services/supabase';
import { uploadImageUri } from '../services/storageUpload';
import { SUPABASE_STORAGE_BUCKET } from '../utils/constants';

interface UploadImageOptions {
  bucket?: string;
  folder?: string;
  /** Si se define, se usa en lugar de `${folder}/${Date.now()}.jpg` */
  path?: string;
}

interface UseImageUploadResult {
  uploading: boolean;
  error: string | null;
  pickImage: () => Promise<string | null>;
  uploadImage: (uri: string, options?: UploadImageOptions) => Promise<string>;
}

export function useImageUpload(): UseImageUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permiso de galería denegado');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return result.assets[0].uri;
  }, []);

  const uploadImage = useCallback(
    async (uri: string, options?: UploadImageOptions): Promise<string> => {
      if (!isSupabaseConfigured()) {
        const message =
          'Supabase no configurado. Revisa .env y reinicia Metro: npx expo start --clear';
        setError(message);
        throw new Error(message);
      }

      setUploading(true);
      setError(null);

      try {
        const result = await uploadImageUri(uri, {
          bucket: options?.bucket ?? SUPABASE_STORAGE_BUCKET,
          folder: options?.folder,
          path: options?.path,
        });
        return result.publicUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al subir la imagen';
        setError(message);
        throw new Error(message);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { uploading, error, pickImage, uploadImage };
}
