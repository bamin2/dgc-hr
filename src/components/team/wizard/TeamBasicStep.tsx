import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, WorkerType } from "@/data/team";

export interface TeamBasicData {
  firstName: string;
  lastName: string;
  preferredName: string;
  workerType: WorkerType;
  country: string;
  email: string;
  sendOfferLetter: boolean;
}

interface TeamBasicStepProps {
  data: TeamBasicData;
  onChange: (data: TeamBasicData) => void;
}

export function TeamBasicStep({ data, onChange }: TeamBasicStepProps) {
  const updateField = <K extends keyof TeamBasicData>(
    field: K,
    value: TeamBasicData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Tell us who you'd like to add
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          You can also edit basic info later, after team member is added
        </p>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={data.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={data.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredName">Preferred first name (optional)</Label>
        <Input
          id="preferredName"
          placeholder="Enter preferred name"
          value={data.preferredName}
          onChange={(e) => updateField("preferredName", e.target.value)}
        />
      </div>

      {/* Worker type */}
      <div className="space-y-3">
        <Label>Worker type</Label>
        <RadioGroup
          value={data.workerType}
          onValueChange={(value) => updateField("workerType", value as WorkerType)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="employee" id="employee" />
            <Label htmlFor="employee" className="cursor-pointer flex-1">
              Employee
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="contractor_individual" id="contractor_individual" />
            <Label htmlFor="contractor_individual" className="cursor-pointer flex-1">
              Contractor (Individual)
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="contractor_business" id="contractor_business" />
            <Label htmlFor="contractor_business" className="cursor-pointer flex-1">
              Contractor (Business)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label>Country</Label>
        <Select value={data.country} onValueChange={(value) => updateField("country", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Personal email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      {/* Hiring options */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Hiring options (optional)</Label>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="sendOffer"
            checked={data.sendOfferLetter}
            onCheckedChange={(checked) =>
              updateField("sendOfferLetter", checked as boolean)
            }
          />
          <Label htmlFor="sendOffer" className="cursor-pointer text-sm">
            Send an offer letter
          </Label>
        </div>
        <p className="text-sm text-primary cursor-pointer hover:underline">
          Set up background checks
        </p>
      </div>
    </div>
  );
}
