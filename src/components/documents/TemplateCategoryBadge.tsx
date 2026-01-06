import { Badge } from "@/components/ui/badge";
import { FileText, Award, Briefcase, FileSignature } from "lucide-react";

interface TemplateCategoryBadgeProps {
  category: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  offer_letter: {
    label: "Offer Letter",
    icon: <FileText className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  salary_certificate: {
    label: "Salary Certificate",
    icon: <Award className="h-3 w-3" />,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  experience_certificate: {
    label: "Experience Certificate",
    icon: <Briefcase className="h-3 w-3" />,
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  contract: {
    label: "Contract",
    icon: <FileSignature className="h-3 w-3" />,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
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
