import { useState } from "react";
import { format } from "date-fns";
import { History, RotateCcw, Eye, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmailTemplateVersions, EmailTemplateVersion } from "@/hooks/useEmailTemplateVersions";
import { EmailTemplatePreview } from "./EmailTemplatePreview";

interface EmailTemplateVersionHistoryProps {
  templateId: string;
  templateType: string;
  onRestore: (version: EmailTemplateVersion) => void;
}

export function EmailTemplateVersionHistory({
  templateId,
  templateType,
  onRestore,
}: EmailTemplateVersionHistoryProps) {
  const { data: versions, isLoading } = useEmailTemplateVersions(templateId);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<EmailTemplateVersion | null>(null);
  const [restoreVersion, setRestoreVersion] = useState<EmailTemplateVersion | null>(null);

  const handleRestore = () => {
    if (restoreVersion) {
      onRestore(restoreVersion);
      setRestoreVersion(null);
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !versions?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No version history</p>
                <p className="text-sm mt-1">
                  Changes will be saved here when you update the template
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <Collapsible
                    key={version.id}
                    open={expandedVersion === version.id}
                    onOpenChange={(open) =>
                      setExpandedVersion(open ? version.id : null)
                    }
                  >
                    <div className="border rounded-lg p-3 bg-card">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-start justify-between">
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                v{version.version_number}
                              </Badge>
                              <span className="text-sm font-medium">
                                {version.change_summary || "Template updated"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {expandedVersion === version.id ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="pt-3 mt-3 border-t">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Subject
                            </p>
                            <p className="text-sm bg-muted/50 p-2 rounded">
                              {version.subject}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Status:
                            </p>
                            <Badge variant={version.is_active ? "default" : "secondary"}>
                              {version.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewVersion(version);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRestoreVersion(version);
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Preview Dialog */}
      {previewVersion && (
        <Sheet open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
          <SheetContent className="w-[700px] sm:max-w-[700px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview - Version {previewVersion.version_number}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-120px)] mt-4">
              <EmailTemplatePreview
                templateType={templateType}
                subject={previewVersion.subject}
                bodyContent={previewVersion.body_content}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Restore Confirmation */}
      <AlertDialog open={!!restoreVersion} onOpenChange={() => setRestoreVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version {restoreVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current template content with version {restoreVersion?.version_number}.
              The current content will be saved as a new version in the history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
