import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentTemplate } from "@/hooks/useDocumentTemplates";
import { renderTemplate } from "@/utils/templateRenderer";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useActiveSmartTags } from "@/hooks/useSmartTags";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DocumentTemplate | null;
}

// Sample employee data for preview
const sampleEmployee = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+1 555-0123",
  address: "123 Main Street, City",
  nationality: "American",
  employee_code: "EMP-001",
  date_of_birth: "1990-05-15",
  join_date: "2024-01-15",
  salary: 5000,
  contract_period: "One Year",
  probation_period: "3 months",
  notice_period: "30 days",
  net_allowances: 1500,
  annual_leave_days: 21,
  employment_type: "Full-time",
  gender: "Male",
  preferred_name: "Johnny",
  country: "United States",
  pay_frequency: "Monthly",
  worker_type: "Employee",
};

const samplePosition = { title: "Software Engineer", job_description: "Develops software applications" };
const sampleDepartment = { name: "Engineering", description: "Product development team" };
const sampleWorkLocation = { name: "Headquarters", currency: "USD", address: "100 Tech Park", city: "San Francisco", country: "USA", is_remote: false };
const sampleManager = { first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com", phone: "+1 555-0124" };

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  const { settings } = useCompanySettings();
  const { data: smartTags } = useActiveSmartTags();

  if (!template) return null;

  const renderedContent = renderTemplate(
    template.content,
    {
      employee: sampleEmployee,
      position: samplePosition,
      department: sampleDepartment,
      workLocation: sampleWorkLocation,
      manager: sampleManager,
      company: settings || {
        name: "Company Name",
        legal_name: "Company Legal Name",
        email: "info@company.com",
        phone: "+1 555-0000",
        logo_url: "",
        address_street: "100 Business Ave",
        address_city: "Business City",
        address_state: "State",
        address_country: "Country",
        address_zip_code: "12345",
      },
    },
    smartTags
  );
  // Sanitize the rendered content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(renderedContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{template.name}</DialogTitle>
            <TemplateCategoryBadge category={template.category} />
          </div>
          <p className="text-sm text-muted-foreground">
            Preview with sample data
          </p>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="bg-white dark:bg-card border rounded-lg p-8 shadow-sm">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
