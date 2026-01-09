import { useState, useEffect } from "react";
import { X, Save, Eye, Code, Variable, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { EmailTemplate, useEmailTemplates, templateVariables } from "@/hooks/useEmailTemplates";
import { EmailTemplatePreview } from "./EmailTemplatePreview";

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}

export function EmailTemplateEditor({ template, open, onClose }: EmailTemplateEditorProps) {
  const { updateTemplate } = useEmailTemplates();
  const [subject, setSubject] = useState(template.subject);
  const [bodyContent, setBodyContent] = useState(template.body_content);
  const [isActive, setIsActive] = useState(template.is_active);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Reset form when template changes
  useEffect(() => {
    setSubject(template.subject);
    setBodyContent(template.body_content);
    setIsActive(template.is_active);
  }, [template]);

  const variables = templateVariables[template.type] || [];
  const hasChanges = 
    subject !== template.subject || 
    bodyContent !== template.body_content || 
    isActive !== template.is_active;

  const handleSave = () => {
    updateTemplate.mutate(
      {
        id: template.id,
        updates: {
          subject,
          body_content: bodyContent,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleInsertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    setBodyContent((prev) => prev + variable);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{template.name}</DialogTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="active-toggle"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active-toggle" className="text-sm">
                  {isActive ? "Active" : "Inactive"}
                </Label>
              </div>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateTemplate.isPending}
              >
                {updateTemplate.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {template.description}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="h-full flex flex-col">
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="edit" className="gap-2">
                <Code className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="flex-1 mt-4 overflow-hidden">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Left: Editor */}
                <div className="col-span-2 space-y-4 overflow-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {`{{variableName}}`} syntax for dynamic values
                    </p>
                  </div>

                  <div className="space-y-2 flex-1">
                    <Label htmlFor="body">Email Body (HTML)</Label>
                    <Textarea
                      id="body"
                      value={bodyContent}
                      onChange={(e) => setBodyContent(e.target.value)}
                      placeholder="Enter HTML content..."
                      className="font-mono text-sm min-h-[400px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the main content area of the email. Header and footer are added automatically.
                    </p>
                  </div>
                </div>

                {/* Right: Variables Reference */}
                <div className="border rounded-lg p-4 bg-muted/20 h-fit">
                  <div className="flex items-center gap-2 mb-3">
                    <Variable className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Available Variables</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Click to insert into the body
                  </p>
                  <div className="space-y-2">
                    {variables.map((variable) => (
                      <button
                        key={variable.name}
                        onClick={() => handleInsertVariable(variable.name)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        <Badge variant="secondary" className="font-mono text-xs mb-1">
                          {`{{${variable.name}}}`}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {variable.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Conditional blocks:</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {`{{#variableName}}...{{/variableName}}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Content only shows if variable has a value
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-4 overflow-auto">
              <EmailTemplatePreview
                templateType={template.type}
                subject={subject}
                bodyContent={bodyContent}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
