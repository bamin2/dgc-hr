import { Badge } from "@/components/ui/badge";
import { FileText, Award, Briefcase, FileSignature } from "lucide-react";

interface TemplateCategoryBadgeProps {
  category: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  offer_letter: {
    label: "Offer Letter",
    icon: <FileText className="h-3 w-3" />,
    className: "bg-info/10 text-info dark:bg-info/10 dark:text-info",
  },
  salary_certificate: {
    label: "Salary Certificate",
    icon: <Award className="h-3 w-3" />,
    className: "bg-success/10 text-success dark:bg-success/10 dark:text-success",
  },
  experience_certificate: {
    label: "Experience Certificate",
    icon: <Briefcase className="h-3 w-3" />,
    className: "bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning",
  },
  contract: {
    label: "Contract",
    icon: <FileSignature className="h-3 w-3" />,
    className: "bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning",
  },
  other: {
    label: "Other",
    icon: <FileText className="h-3 w-3" />,
    className: "bg-muted text-muted-foreground",
  },
};

export function TemplateCategoryBadge({ category }: TemplateCategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;

  return (
    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function getCategoryLabel(category: string): string {
  return categoryConfig[category]?.label || category;
}

export const templateCategories = [
  { value: "offer_letter", label: "Offer Letter" },
  { value: "salary_certificate", label: "Salary Certificate" },
  { value: "experience_certificate", label: "Experience Certificate" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];
