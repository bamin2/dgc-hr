import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles } from "lucide-react";

interface TemplateSourceToggleProps {
  useDefault: boolean;
  onChange: (useDefault: boolean) => void;
  disabled?: boolean;
}

export function TemplateSourceToggle({ useDefault, onChange, disabled }: TemplateSourceToggleProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Template Source</Label>
      <RadioGroup
        value={useDefault ? "default" : "custom"}
        onValueChange={(value) => onChange(value === "default")}
        disabled={disabled}
        className="grid gap-2"
      >
        <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
          <RadioGroupItem value="default" id="default" className="mt-0.5" />
          <div className="flex-1">
            <Label htmlFor="default" className="flex items-center gap-2 cursor-pointer font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Use default DGC-branded template
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Professional template with company branding and colors
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
          <RadioGroupItem value="custom" id="custom" className="mt-0.5" />
          <div className="flex-1">
            <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Use custom template content
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Your edited template stored in the database
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
