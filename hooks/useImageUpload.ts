import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

interface UploadImageOptions {
  bucket?: string;
  folder?: string;
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
      setUploading(true);
      setError(null);

      try {
        // TODO: reemplazar con subida real a Supabase Storage
        // const bucket = options?.bucket ?? 'avatars';
        // const fileName = `${options?.folder ?? 'uploads'}/${Date.now()}.jpg`;
        // const response = await fetch(uri);
        // const blob = await response.blob();
        // const { data, error: uploadError } = await supabase.storage
        //   .from(bucket)
        //   .upload(fileName, blob, { contentType: 'image/jpeg' });
        // if (uploadError) throw uploadError;
        // const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
        // return publicUrl.publicUrl;

        void uri;
        void options;

        await new Promise((resolve) => setTimeout(resolve, 1500));

        return `https://picsum.photos/seed/upload-${Date.now()}/400/400`;
      } catch {
        const message = 'Error al subir la imagen';
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
