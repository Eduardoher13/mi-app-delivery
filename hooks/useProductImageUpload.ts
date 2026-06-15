import { useCallback } from 'react';

import {
  SUPABASE_FOLDER_PRODUCTS,
  SUPABASE_STORAGE_BUCKET,
} from '../utils/constants';
import { useImageUpload } from './useImageUpload';

interface UseProductImageUploadResult {
  uploading: boolean;
  error: string | null;
  pickImage: () => Promise<string | null>;
  uploadProductImage: (
    uri: string,
    companyId: string,
    productId: string,
  ) => Promise<string>;
}

export function useProductImageUpload(): UseProductImageUploadResult {
  const { uploadImage, pickImage, uploading, error } = useImageUpload();

  const uploadProductImage = useCallback(
    async (uri: string, companyId: string, productId: string): Promise<string> => {
      return uploadImage(uri, {
        bucket: SUPABASE_STORAGE_BUCKET,
        path: `${SUPABASE_FOLDER_PRODUCTS}/${companyId}/${productId}.jpg`,
      });
    },
    [uploadImage],
  );

  return { uploading, error, pickImage, uploadProductImage };
}
