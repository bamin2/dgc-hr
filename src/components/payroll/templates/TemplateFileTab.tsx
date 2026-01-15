import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Download, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkLocations } from "@/hooks/useWorkLocations";

interface TemplateFileTabProps {
  docxStoragePath: string | null;
  originalFilename: string | null;
  onFileUploaded: (storagePath: string, filename: string) => void;
  isUploading?: boolean;
  setIsUploading?: (uploading: boolean) => void;
  workLocationId: string | null;
  onWorkLocationChange: (id: string | null) => void;
}

export function TemplateFileTab({
  docxStoragePath,
  originalFilename,
  onFileUploaded,
  isUploading: externalIsUploading,
  setIsUploading: externalSetIsUploading,
  workLocationId,
  onWorkLocationChange,
}: TemplateFileTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const { data: workLocations } = useWorkLocations();

  const isUploading = externalIsUploading ?? internalIsUploading;
  const setIsUploading = externalSetIsUploading ?? setInternalIsUploading;

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      toast.error("Please upload a DOCX file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `templates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payslip-templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      onFileUploaded(filePath, file.name);
      toast.success("Template file uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload template file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!docxStoragePath) return;

    try {
      const { data, error } = await supabase.storage
        .from('payslip-templates')
        .download(docxStoragePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFilename || 'template.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download template");
    }
  };

  const handleRemoveFile = () => {
    onFileUploaded('', '');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template File</CardTitle>
          <CardDescription>
            Upload a Word document (.docx) with smart tags that will be replaced with employee data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {docxStoragePath ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{originalFilename}</p>
                  <p className="text-sm text-muted-foreground">Current template file</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : null}

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {docxStoragePath ? "Replace template file" : "Upload template file"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a DOCX file here, or click to browse
            </p>
            <Label htmlFor="template-file">
              <Button variant="outline" disabled={isUploading} asChild>
                <span>
                  {isUploading ? "Uploading..." : "Browse Files"}
                </span>
              </Button>
            </Label>
            <Input
              id="template-file"
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Location</CardTitle>
          <CardDescription>
            Assign this template to a specific work location, or leave empty for a global template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Work Location (Optional)</Label>
            <Select
              value={workLocationId || "global"}
              onValueChange={(value) => onWorkLocationChange(value === "global" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Global (All Locations)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (All Locations)</SelectItem>
                {workLocations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Location-specific templates take priority over global templates when generating payslips
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Use smart tags like <code className="bg-muted px-1 rounded">{"<<Employee Name>>"}</code> in your template. 
          These will be replaced with actual employee data when generating payslips. 
          See the "Smart Tags" tab for a complete list of available tags.
        </AlertDescription>
      </Alert>
    </div>
  );
}
