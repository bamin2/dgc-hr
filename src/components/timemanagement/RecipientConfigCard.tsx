import { useState } from "react";
import { Users, Building2, Mail, X, Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { EmailTemplate, EmailRecipientConfig, useEmailTemplates } from "@/hooks/useEmailTemplates";

interface RecipientConfigCardProps {
  template: EmailTemplate;
}

const defaultConfig: EmailRecipientConfig = {
  send_to_manager: false,
  send_to_hr: false,
  custom_emails: [],
};

export function RecipientConfigCard({ template }: RecipientConfigCardProps) {
  const { updateTemplate } = useEmailTemplates();
  const config: EmailRecipientConfig = {
    ...defaultConfig,
    ...(template.recipient_config || {}),
  };
  
  const [newEmail, setNewEmail] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  const updateConfig = async (updates: Partial<EmailRecipientConfig>) => {
    const newConfig = { ...config, ...updates };
    
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: { recipient_config: newConfig },
      });
    } catch (error) {
      console.error("Failed to update recipient config:", error);
    }
  };

  const handleToggleManager = async (checked: boolean) => {
    await updateConfig({ send_to_manager: checked });
  };

  const handleToggleHR = async (checked: boolean) => {
    await updateConfig({ send_to_hr: checked });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = async () => {
    const email = newEmail.trim().toLowerCase();
    
    if (!email) return;
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (config.custom_emails.includes(email)) {
      toast.error("This email is already added");
      return;
    }
    
    setIsAddingEmail(true);
    try {
      await updateConfig({
        custom_emails: [...config.custom_emails, email],
      });
      setNewEmail("");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    await updateConfig({
      custom_emails: config.custom_emails.filter((e) => e !== emailToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        Additional Recipients
      </h4>
      
      {/* Manager Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor={`manager-${template.id}`} className="flex items-center gap-2 cursor-pointer">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Send copy to employee's manager</span>
        </Label>
        <Switch
          id={`manager-${template.id}`}
          checked={config.send_to_manager}
          onCheckedChange={handleToggleManager}
          disabled={updateTemplate.isPending}
        />
      </div>
      
      {/* HR Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor={`hr-${template.id}`} className="flex items-center gap-2 cursor-pointer">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Send copy to HR department</span>
        </Label>
        <Switch
          id={`hr-${template.id}`}
          checked={config.send_to_hr}
          onCheckedChange={handleToggleHR}
          disabled={updateTemplate.isPending}
        />
      </div>
      
      {/* Custom Emails */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Custom email addresses
        </Label>
        
        {/* Email Input */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isAddingEmail}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEmail}
            disabled={!newEmail.trim() || isAddingEmail}
          >
            {isAddingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        
        {/* Email List */}
        {config.custom_emails.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {config.custom_emails.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="pr-1 flex items-center gap-1"
              >
                {email}
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`Remove ${email}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {config.custom_emails.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No custom emails configured
          </p>
        )}
      </div>
    </div>
  );
}
