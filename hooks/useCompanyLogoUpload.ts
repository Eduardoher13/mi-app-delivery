import { useCallback } from 'react';

import {
  SUPABASE_FOLDER_COMPANY_LOGOS,
  SUPABASE_STORAGE_BUCKET,
} from '../utils/constants';
import { useImageUpload } from './useImageUpload';

interface UseCompanyLogoUploadResult {
  uploading: boolean;
  error: string | null;
  pickImage: () => Promise<string | null>;
  uploadCompanyLogo: (uri: string, companyId: string) => Promise<string>;
}

export function useCompanyLogoUpload(): UseCompanyLogoUploadResult {
  const { uploadImage, pickImage, uploading, error } = useImageUpload();

  const uploadCompanyLogo = useCallback(
    async (uri: string, companyId: string): Promise<string> => {
      return uploadImage(uri, {
        bucket: SUPABASE_STORAGE_BUCKET,
        path: `${SUPABASE_FOLDER_COMPANY_LOGOS}/${companyId}.jpg`,
      });
    },
    [uploadImage],
  );

  return { uploading, error, pickImage, uploadCompanyLogo };
}
