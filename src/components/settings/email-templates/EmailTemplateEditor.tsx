import { useState, useEffect, useMemo } from "react";
import { Save, Eye, Code, Tag, Loader2, FileText, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailTemplate, useEmailTemplates, templateTagCategories } from "@/hooks/useEmailTemplates";
import { EmailTemplatePreview } from "./EmailTemplatePreview";
import { RichTextEditor } from "./RichTextEditor";
import { EmailTemplateVersionHistory } from "./EmailTemplateVersionHistory";
import { EmailTemplateVersion } from "@/hooks/useEmailTemplateVersions";
import { useActiveSmartTags } from "@/hooks/useSmartTags";

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}

export function EmailTemplateEditor({ template, open, onClose }: EmailTemplateEditorProps) {
  const { updateTemplate } = useEmailTemplates();
  const { user } = useAuth();
  const { data: allSmartTags } = useActiveSmartTags();
  const [subject, setSubject] = useState(template.subject);
  const [bodyContent, setBodyContent] = useState(template.body_content);
  const [isActive, setIsActive] = useState(template.is_active);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Reset form when template changes
  useEffect(() => {
    setSubject(template.subject);
    setBodyContent(template.body_content);
    setIsActive(template.is_active);
  }, [template]);

  // Filter smart tags by categories relevant to this template type
  const relevantCategories = templateTagCategories[template.type] || ["Employee", "Company", "Date"];
  
  const filteredSmartTags = useMemo(() => {
    if (!allSmartTags) return [];
    return allSmartTags.filter(tag => relevantCategories.includes(tag.category));
  }, [allSmartTags, relevantCategories]);

  // Group tags by category
  const groupedTags = useMemo(() => {
    const groups: Record<string, typeof filteredSmartTags> = {};
    for (const tag of filteredSmartTags) {
      if (!groups[tag.category]) {
        groups[tag.category] = [];
      }
      groups[tag.category].push(tag);
    }
    return groups;
  }, [filteredSmartTags]);

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

  const handleInsertTag = (tag: string) => {
    setBodyContent((prev) => prev + tag);
  };

  const handleRestoreVersion = (version: EmailTemplateVersion) => {
    setSubject(version.subject);
    setBodyContent(version.body_content);
    setIsActive(version.is_active);
    toast.success(`Restored to version ${version.version_number}. Click Save to apply changes.`);
  };

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast.error("Could not determine your email address");
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: {
          subject,
          bodyContent,
          recipientEmail: user.email,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Test email sent to ${user.email}`);
    } catch (error) {
      console.error("Failed to send test email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent size="4xl" className="h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 pr-12">
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
              <EmailTemplateVersionHistory
                templateId={template.id}
                templateType={template.type}
                onRestore={handleRestoreVersion}
              />
              <Button
                variant="outline"
                onClick={handleSendTestEmail}
                disabled={isSendingTest || !subject || !bodyContent}
              >
                {isSendingTest ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
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
            <TabsList>
              <TabsTrigger value="edit">
                <Code className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
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
                      Use smart tags like <code className="bg-muted px-1 rounded">&lt;&lt;First Name&gt;&gt;</code> for dynamic values
                    </p>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <Label>Email Body</Label>
                      <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                        <Toggle
                          size="sm"
                          pressed={editorMode === "visual"}
                          onPressedChange={() => setEditorMode("visual")}
                          className="h-7 px-2 text-xs data-[state=on]:bg-background"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Visual
                        </Toggle>
                        <Toggle
                          size="sm"
                          pressed={editorMode === "html"}
                          onPressedChange={() => setEditorMode("html")}
                          className="h-7 px-2 text-xs data-[state=on]:bg-background"
                        >
                          <Code className="h-3.5 w-3.5 mr-1" />
                          HTML
                        </Toggle>
                      </div>
                    </div>
                    
                    {editorMode === "visual" ? (
                      <RichTextEditor
                        content={bodyContent}
                        onChange={setBodyContent}
                      />
                    ) : (
                      <Textarea
                        id="body"
                        value={bodyContent}
                        onChange={(e) => setBodyContent(e.target.value)}
                        placeholder="Enter HTML content..."
                        className="font-mono text-sm min-h-[400px] resize-none"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      This is the main content area of the email. Header and footer are added automatically.
                    </p>
                  </div>
                </div>

                {/* Right: Smart Tags Reference */}
                <div className="border rounded-lg bg-muted/20 h-full flex flex-col overflow-hidden">
                  <div className="p-4 border-b shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-sm">Smart Tags</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to insert into the email body
                    </p>
                  </div>
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4 space-y-4">
                      {Object.entries(groupedTags).map(([category, tags]) => (
                        <div key={category}>
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {category}
                          </h5>
                          <div className="space-y-1">
                            {tags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleInsertTag(tag.tag)}
                                className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                              >
                                <Badge variant="secondary" className="font-mono text-xs mb-1">
                                  {tag.tag}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {tag.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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
