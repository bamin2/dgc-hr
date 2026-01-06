import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useBenefitDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (file: File, planId: string): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${planId}/${Date.now()}.${fileExt}`;

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

  return { uploadDocument, isUploading };
}
