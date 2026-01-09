import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Building,
  Building2,
  Landmark,
  Home,
  Store,
  Briefcase,
  Wallet,
  CreditCard,
  Receipt,
  Star,
  Sparkles,
  Gem,
  Crown,
  Shield,
  Leaf,
  Flower,
  Sun,
  Mountain,
  Cpu,
  Globe,
  Zap,
  Rocket,
  Heart,
  Hexagon,
  Circle,
  Square,
  Triangle,
  Target,
  Award,
  Flag,
  Bookmark,
  Box,
  Package,
  Users,
  Slash,
  type LucideIcon,
} from "lucide-react";

const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Building", icon: Building },
  { name: "Building2", icon: Building2 },
  { name: "Landmark", icon: Landmark },
  { name: "Home", icon: Home },
  { name: "Store", icon: Store },
  { name: "Briefcase", icon: Briefcase },
  { name: "Wallet", icon: Wallet },
  { name: "CreditCard", icon: CreditCard },
  { name: "Receipt", icon: Receipt },
  { name: "Star", icon: Star },
  { name: "Sparkles", icon: Sparkles },
  { name: "Gem", icon: Gem },
  { name: "Crown", icon: Crown },
  { name: "Shield", icon: Shield },
  { name: "Leaf", icon: Leaf },
  { name: "Flower", icon: Flower },
  { name: "Sun", icon: Sun },
  { name: "Mountain", icon: Mountain },
  { name: "Cpu", icon: Cpu },
  { name: "Globe", icon: Globe },
  { name: "Zap", icon: Zap },
  { name: "Rocket", icon: Rocket },
  { name: "Heart", icon: Heart },
  { name: "Hexagon", icon: Hexagon },
  { name: "Circle", icon: Circle },
  { name: "Square", icon: Square },
  { name: "Triangle", icon: Triangle },
  { name: "Target", icon: Target },
  { name: "Award", icon: Award },
  { name: "Flag", icon: Flag },
  { name: "Bookmark", icon: Bookmark },
  { name: "Box", icon: Box },
  { name: "Package", icon: Package },
  { name: "Users", icon: Users },
  { name: "Slash", icon: Slash },
  { name: "SlashFlipped", icon: Slash },
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = ICON_OPTIONS.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <Label>Select an icon</Label>
      <Input
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />
      <div className="grid grid-cols-8 gap-2 p-3 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
        {filteredIcons.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "p-2 rounded-md hover:bg-accent transition-colors flex items-center justify-center",
              value === name && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            title={name === "SlashFlipped" ? "Slash (Forward)" : name}
          >
            <Icon className={cn("w-5 h-5", name === "SlashFlipped" && "scale-x-[-1]")} />
          </button>
        ))}
        {filteredIcons.length === 0 && (
          <p className="col-span-8 text-center text-muted-foreground text-sm py-4">
            No icons found
          </p>
        )}
      </div>
    </div>
  );
}
