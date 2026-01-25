import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useInsuranceCardUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadCard = async (
    file: File,
    enrollmentId: string,
    beneficiaryId?: string
  ): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const subfolder = beneficiaryId 
        ? `dependents/${beneficiaryId}` 
        : `employees/${enrollmentId}`;
      const fileName = `insurance-cards/${subfolder}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('benefit-documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from('benefit-documents')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadCard, isUploading };
}
