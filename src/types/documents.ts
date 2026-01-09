/**
 * Centralized Document Types
 * These types are shared across document-related hooks and components
 */

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string | null;
  content: string;
  is_active: boolean;
  docx_template_url: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentTemplateInput = Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>;

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  requires_expiry: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type_id: string;
  document_name: string;
  document_number: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  visible_to_employee: boolean | null;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  document_type?: DocumentType;
}

export interface GeneratedDocument {
  id: string;
  name: string;
  content: string;
  template_id: string | null;
  employee_id: string | null;
  generated_by: string | null;
  generated_at: string;
}
