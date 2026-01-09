import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSettings {
  daysBeforeExpiry: number;
  notifyEmployee: boolean;
  notifyManager: boolean;
  notifyHr: boolean;
}

interface ExpiryNotificationSettingsProps {
  value: NotificationSettings;
  onChange: (value: NotificationSettings) => void;
  disabled?: boolean;
}

const daysOptions = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];

export function ExpiryNotificationSettings({
  value,
  onChange,
  disabled,
}: ExpiryNotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Notify before expiry</Label>
        <Select
          value={value.daysBeforeExpiry.toString()}
          onValueChange={(v) =>
            onChange({ ...value, daysBeforeExpiry: parseInt(v) })
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {daysOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Who to notify</Label>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-employee"
              checked={value.notifyEmployee}
              onCheckedChange={(checked) =>
                onChange({ ...value, notifyEmployee: !!checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="notify-employee" className="font-normal cursor-pointer">
              Employee
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-manager"
              checked={value.notifyManager}
              onCheckedChange={(checked) =>
                onChange({ ...value, notifyManager: !!checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="notify-manager" className="font-normal cursor-pointer">
              Manager
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-hr"
              checked={value.notifyHr}
              onCheckedChange={(checked) =>
                onChange({ ...value, notifyHr: !!checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="notify-hr" className="font-normal cursor-pointer">
              HR
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
