import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplateCategoryBadge } from "./TemplateCategoryBadge";
import { DocumentTemplate } from "@/hooks/useDocumentTemplates";
import { Edit, Trash2, Eye, FileText } from "lucide-react";

interface TemplateCardProps {
  template: DocumentTemplate;
  onEdit: (template: DocumentTemplate) => void;
  onDelete: (template: DocumentTemplate) => void;
  onPreview: (template: DocumentTemplate) => void;
}

export function TemplateCard({ template, onEdit, onDelete, onPreview }: TemplateCardProps) {
  // Get a preview snippet of the content (first 100 chars, stripped of tags)
  const contentPreview = template.content
    .replace(/<<[^>]+>>/g, "...")
    .substring(0, 100)
    .trim();

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium leading-tight">{template.name}</h3>
          </div>
          {!template.is_active && (
            <Badge variant="outline" className="text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>
        <TemplateCategoryBadge category={template.category} />
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description || contentPreview + "..."}
        </p>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onPreview(template)}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(template)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(template)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
