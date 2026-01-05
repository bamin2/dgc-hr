import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File, employeeId: string): Promise<string> => {
    setIsUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
}
