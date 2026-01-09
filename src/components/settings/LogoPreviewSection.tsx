import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface LogoPreviewSectionProps {
  sidebarLogoUrl: string;
  documentLogoUrl: string;
  companyName: string;
  displayType: 'logo' | 'icon';
  iconName?: string;
}

export const LogoPreviewSection = ({
  sidebarLogoUrl,
  documentLogoUrl,
  companyName,
  displayType,
}: LogoPreviewSectionProps) => {
  const initials = companyName
    ? companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()
    : 'CO';

  const effectiveDocumentLogo = documentLogoUrl || sidebarLogoUrl;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Logo Preview</CardTitle>
        <CardDescription>See how your logos will appear in different contexts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sidebar Preview */}
          <div className="rounded-lg border bg-sidebar p-4">
            <p className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-3">
              Sidebar Preview
            </p>
            <div className="rounded-lg bg-sidebar-accent/50 p-3 space-y-3">
              {/* Logo and company name */}
              <div className="flex items-center gap-2.5">
                {displayType === 'logo' && sidebarLogoUrl ? (
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarImage src={sidebarLogoUrl} className="object-contain" />
                    <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-sidebar-primary-foreground" />
                  </div>
                )}
                <span className="font-semibold text-sm text-sidebar-foreground truncate">
                  {companyName || 'Company Name'}
                </span>
              </div>
              {/* Mock menu items */}
              <div className="space-y-1">
                <div className="h-7 bg-sidebar-accent rounded-md flex items-center px-2.5 text-xs text-sidebar-foreground/80">
                  Dashboard
                </div>
                <div className="h-7 bg-transparent rounded-md flex items-center px-2.5 text-xs text-sidebar-foreground/60">
                  My Profile
                </div>
                <div className="h-7 bg-transparent rounded-md flex items-center px-2.5 text-xs text-sidebar-foreground/60">
                  Directory
                </div>
              </div>
            </div>
            <p className="text-xs text-sidebar-foreground/50 mt-3">
              Shows in the navigation sidebar
            </p>
          </div>

          {/* Document Preview */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Document Preview
            </p>
            <div className="rounded-lg bg-background border shadow-sm p-4">
              {/* Document header */}
              <div className="flex items-start gap-3 border-b pb-3 mb-3">
                {effectiveDocumentLogo ? (
                  <img 
                    src={effectiveDocumentLogo} 
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
              Used in generated documents and emails
            </p>
          </div>
        </div>

        {/* Fallback notice */}
        {!documentLogoUrl && sidebarLogoUrl && (
          <p className="text-xs text-muted-foreground mt-3 text-center italic">
            Document preview is using the sidebar logo. Upload a document logo for a different appearance.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
