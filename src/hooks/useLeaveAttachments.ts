import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export async function uploadLeaveAttachments(leaveRequestId: string, files: File[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  for (const file of files) {
    const filePath = `${leaveRequestId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('leave-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from('leave_request_attachments')
      .insert({
        leave_request_id: leaveRequestId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      });

    if (dbError) throw dbError;
  }
}

export function useLeaveRequestAttachments(leaveRequestId: string | undefined) {
  return useQuery({
    queryKey: ['leave-request-attachments', leaveRequestId],
    queryFn: async () => {
      if (!leaveRequestId) return [];
      const { data, error } = await supabase
        .from('leave_request_attachments')
        .select('*')
        .eq('leave_request_id', leaveRequestId)
        .order('created_at');

      if (error) throw error;
      return data || [];
    },
    enabled: !!leaveRequestId,
  });
}

export function getAttachmentDownloadUrl(filePath: string) {
  const { data } = supabase.storage
    .from('leave-attachments')
    .getPublicUrl(filePath);
  
  // For private buckets, use createSignedUrl instead
  return null; // We'll use signed URLs
}

export async function getSignedAttachmentUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from('leave-attachments')
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}
