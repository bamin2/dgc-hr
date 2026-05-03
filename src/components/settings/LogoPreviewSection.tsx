import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CheckCircle2 } from "lucide-react";

interface LogoPreviewSectionProps {
  documentLogoUrl: string;
  emailLogoUrl: string;
  companyName: string;
}

export const LogoPreviewSection = ({
  documentLogoUrl,
  emailLogoUrl,
  companyName,
}: LogoPreviewSectionProps) => {
  // Email preview uses emailLogoUrl, falling back to documentLogoUrl
  const effectiveEmailLogo = emailLogoUrl || documentLogoUrl;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Logo Preview</CardTitle>
        <CardDescription>See how your logos will appear in different contexts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {/* Document Preview Tab */}
          <TabsContent value="document">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Document Preview
              </p>
              <div className="rounded-lg bg-background border shadow-sm p-4">
                {/* Document header */}
                <div className="flex items-start gap-3 border-b pb-3 mb-3">
                  {documentLogoUrl ? (
                    <img 
                      src={documentLogoUrl} 
                      alt="Document Logo"
                      className="h-10 w-auto max-w-[120px] object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{companyName || 'Company Name'}</p>
                    <p className="text-xs text-muted-foreground">123 Business Street</p>
                  </div>
                </div>
                {/* Mock document content */}
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-2/5"></div>
                  <div className="h-2 bg-muted/60 rounded w-full"></div>
                  <div className="h-2 bg-muted/60 rounded w-4/5"></div>
                  <div className="h-2 bg-muted/60 rounded w-full"></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Used in generated documents like payslips and offer letters
              </p>
            </div>
          </TabsContent>

          {/* Email Preview Tab */}
          <TabsContent value="email">
            <div className="rounded-lg border bg-[#f4f4f5] p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Email Preview
              </p>
              <div className="max-w-[380px] mx-auto rounded-xl overflow-hidden shadow-sm border">
                {/* Email header with gradient */}
                <div 
                  className="p-4"
                  style={{ background: 'linear-gradient(135deg, #0F2A28 0%, #0A1D1B 100%)' }}
                >
                  <div className="flex items-center gap-3">
                    {effectiveEmailLogo ? (
                      <img 
                        src={effectiveEmailLogo} 
                        alt="Email Logo"
                        className="h-8 w-auto max-w-[80px] object-contain brightness-0 invert"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-white font-semibold text-sm">
                      {companyName || 'Company Name'}
                    </span>
                  </div>
                </div>
                
                {/* Email body */}
                <div className="bg-white p-4 space-y-3">
                  {/* Success header */}
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold text-sm">Leave Request Approved</span>
                  </div>
                  
                  {/* Sample email text */}
                  <p className="text-xs text-gray-600">
                    Hi Employee, great news! Your leave request has been approved by your manager.
                  </p>
                  
                  {/* Mock data table */}
                  <div className="rounded-lg border text-xs overflow-hidden">
                    <div className="flex border-b">
                      <div className="w-1/2 p-2 bg-gray-50 font-medium text-gray-700">Leave Type</div>
                      <div className="w-1/2 p-2 text-gray-600">Annual Leave</div>
                    </div>
                    <div className="flex border-b">
                      <div className="w-1/2 p-2 bg-gray-50 font-medium text-gray-700">Start Date</div>
                      <div className="w-1/2 p-2 text-gray-600">Jan 15, 2026</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/2 p-2 bg-gray-50 font-medium text-gray-700">End Date</div>
                      <div className="w-1/2 p-2 text-gray-600">Jan 17, 2026</div>
                    </div>
                  </div>
                </div>
                
                {/* Email footer */}
                <div className="bg-[#f9fafb] p-3 border-t">
                  <p className="text-[10px] text-gray-500 text-center">
                    {companyName || 'Company Name'} • contact@company.com
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                How your logo appears in email notifications
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Fallback notice */}
        {!emailLogoUrl && documentLogoUrl && (
          <p className="text-xs text-muted-foreground mt-3 text-center italic">
            Email preview is using the document logo. Upload an email logo for a different appearance.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
