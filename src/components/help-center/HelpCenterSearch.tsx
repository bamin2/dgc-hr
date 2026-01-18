import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HelpCenterSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HelpCenterSearch({ value, onChange }: HelpCenterSearchProps) {
  return (
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search for help topics, FAQs, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-12 text-base"
      />
    </div>
  );
}
