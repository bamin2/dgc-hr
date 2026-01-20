import { useState, useEffect } from "react";
import { Download, FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface PayslipPdfViewerProps {
  pdfStoragePath: string;
  periodStart: string;
  periodEnd: string;
}

export function PayslipPdfViewer({ pdfStoragePath, periodStart, periodEnd }: PayslipPdfViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getSignedUrl() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: urlError } = await supabase.storage
          .from("payslips")
          .createSignedUrl(pdfStoragePath, 3600); // 1 hour expiry

        if (urlError) throw urlError;
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error("Error getting signed URL:", err);
        setError("Failed to load payslip PDF");
      } finally {
        setIsLoading(false);
      }
    }

    if (pdfStoragePath) {
      getSignedUrl();
    }
  }, [pdfStoragePath]);

  const handleDownload = () => {
    if (signedUrl) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = `payslip-${periodStart}-to-${periodEnd}.pdf`;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading payslip...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !signedUrl) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">{error || "Payslip PDF not available"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleOpenInNewTab}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <iframe
            src={signedUrl}
            className="w-full h-[800px] border-0"
            title="Payslip PDF"
          />
        </CardContent>
      </Card>
    </div>
  );
}
