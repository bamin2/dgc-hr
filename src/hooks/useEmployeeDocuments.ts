import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  requiresExpiry: boolean;
  isActive: boolean;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentTypeId: string;
  documentTypeName: string;
  documentName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  expiryDate: string | null;
  issueDate: string | null;
  documentNumber: string | null;
  notes: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  notifications: DocumentNotification | null;
}

export interface DocumentNotification {
  id: string;
  employeeDocumentId: string;
  daysBeforeExpiry: number;
  notifyEmployee: boolean;
  notifyManager: boolean;
  notifyHr: boolean;
  isSent: boolean;
  sentAt: string | null;
}

interface UploadDocumentInput {
  employeeId: string;
  documentTypeId: string;
  documentName: string;
  file: File;
  expiryDate?: string | null;
  issueDate?: string | null;
  documentNumber?: string | null;
  notes?: string | null;
  notifications?: {
    daysBeforeExpiry: number;
    notifyEmployee: boolean;
    notifyManager: boolean;
    notifyHr: boolean;
  };
}

interface UpdateDocumentInput {
  id: string;
  documentName?: string;
  expiryDate?: string | null;
  issueDate?: string | null;
  documentNumber?: string | null;
  notes?: string | null;
  notifications?: {
    daysBeforeExpiry: number;
    notifyEmployee: boolean;
    notifyManager: boolean;
    notifyHr: boolean;
  };
}

// Fetch document types
export function useDocumentTypes() {
  return useQuery({
    queryKey: queryKeys.documents.types,
    queryFn: async (): Promise<DocumentType[]> => {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      return (data || []).map((dt) => ({
        id: dt.id,
        name: dt.name,
        description: dt.description,
        requiresExpiry: dt.requires_expiry ?? false,
        isActive: dt.is_active ?? true,
      }));
    },
  });
}

// Fetch employee documents with notifications
export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.documents.byEmployee(employeeId || ''),
    queryFn: async (): Promise<EmployeeDocument[]> => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from("employee_documents")
        .select(`
          *,
          document_types (name),
          document_expiry_notifications (*)
        `)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((doc: any) => {
        const notification = doc.document_expiry_notifications?.[0] || null;
        return {
          id: doc.id,
          employeeId: doc.employee_id,
          documentTypeId: doc.document_type_id,
          documentTypeName: doc.document_types?.name || "Unknown",
          documentName: doc.document_name,
          fileUrl: doc.file_url,
          fileName: doc.file_name,
          fileSize: doc.file_size,
          mimeType: doc.mime_type,
          expiryDate: doc.expiry_date,
          issueDate: doc.issue_date,
          documentNumber: doc.document_number,
          notes: doc.notes,
          uploadedBy: doc.uploaded_by,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          notifications: notification
            ? {
                id: notification.id,
                employeeDocumentId: notification.employee_document_id,
                daysBeforeExpiry: notification.days_before_expiry,
                notifyEmployee: notification.notify_employee,
                notifyManager: notification.notify_manager,
                notifyHr: notification.notify_hr,
                isSent: notification.is_sent,
                sentAt: notification.sent_at,
              }
            : null,
        };
      });
    },
    enabled: !!employeeId,
  });
}

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // Generate unique file path
      const fileExt = input.file.name.split(".").pop();
      const fileName = `${input.employeeId}/${Date.now()}-${input.file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("employee-documents")
        .upload(fileName, input.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("employee-documents")
        .getPublicUrl(fileName);

      // Insert document record
      const { data: docData, error: docError } = await supabase
        .from("employee_documents")
        .insert({
          employee_id: input.employeeId,
          document_type_id: input.documentTypeId,
          document_name: input.documentName,
          file_url: urlData.publicUrl,
          file_name: input.file.name,
          file_size: input.file.size,
          mime_type: input.file.type,
          expiry_date: input.expiryDate || null,
          issue_date: input.issueDate || null,
          document_number: input.documentNumber || null,
          notes: input.notes || null,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Insert notification settings if provided and document has expiry
      if (input.notifications && input.expiryDate) {
        const { error: notifError } = await supabase
          .from("document_expiry_notifications")
          .insert({
            employee_document_id: docData.id,
            days_before_expiry: input.notifications.daysBeforeExpiry,
            notify_employee: input.notifications.notifyEmployee,
            notify_manager: input.notifications.notifyManager,
            notify_hr: input.notifications.notifyHr,
          });

        if (notifError) throw notifError;
      }

      return docData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byEmployee(variables.employeeId),
      });
    },
  });
}

// Update document
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDocumentInput) => {
      // Update document record
      const { data: docData, error: docError } = await supabase
        .from("employee_documents")
        .update({
          document_name: input.documentName,
          expiry_date: input.expiryDate,
          issue_date: input.issueDate,
          document_number: input.documentNumber,
          notes: input.notes,
        })
        .eq("id", input.id)
        .select("employee_id")
        .single();

      if (docError) throw docError;

      // Update or insert notification settings
      if (input.notifications) {
        // Check if notification exists
        const { data: existingNotif } = await supabase
          .from("document_expiry_notifications")
          .select("id")
          .eq("employee_document_id", input.id)
          .single();

        if (existingNotif) {
          await supabase
            .from("document_expiry_notifications")
            .update({
              days_before_expiry: input.notifications.daysBeforeExpiry,
              notify_employee: input.notifications.notifyEmployee,
              notify_manager: input.notifications.notifyManager,
              notify_hr: input.notifications.notifyHr,
            })
            .eq("id", existingNotif.id);
        } else if (input.expiryDate) {
          await supabase.from("document_expiry_notifications").insert({
            employee_document_id: input.id,
            days_before_expiry: input.notifications.daysBeforeExpiry,
            notify_employee: input.notifications.notifyEmployee,
            notify_manager: input.notifications.notifyManager,
            notify_hr: input.notifications.notifyHr,
          });
        }
      }

      return docData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byEmployee(data.employee_id),
      });
    },
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      employeeId,
      fileUrl,
    }: {
      id: string;
      employeeId: string;
      fileUrl: string;
    }) => {
      // Extract file path from URL
      const urlParts = fileUrl.split("/employee-documents/");
      const filePath = urlParts[1];

      // Delete from storage
      if (filePath) {
        await supabase.storage.from("employee-documents").remove([filePath]);
      }

      // Delete document record (notifications cascade delete)
      const { error } = await supabase
        .from("employee_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { id, employeeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.byEmployee(data.employeeId),
      });
    },
  });
}

// Get signed URL for private file access
export function useGetDocumentUrl() {
  return useMutation({
    mutationFn: async (fileUrl: string) => {
      // Extract file path from URL
      const urlParts = fileUrl.split("/employee-documents/");
      const filePath = urlParts[1];

      if (!filePath) throw new Error("Invalid file URL");

      const { data, error } = await supabase.storage
        .from("employee-documents")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      return data.signedUrl;
    },
  });
}
