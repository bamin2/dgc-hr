import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/settings/ImageUpload";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";

export interface TeamBasicData {
  avatar: string;
  firstName: string;
  secondName: string;
  lastName: string;
  nationality: string;
  email: string;
  mobileCountryCode: string;
  mobileNumber: string;
  officeCountryCode: string;
  officeNumber: string;
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

  const getInitials = () => {
    const first = data.firstName?.[0] || "";
    const last = data.lastName?.[0] || "";
    return (first + last).toUpperCase() || "TM";
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

      {/* Photo upload */}
      <div className="space-y-2">
        <Label>Photo (optional)</Label>
        <ImageUpload
          value={data.avatar}
          onChange={(value) => updateField("avatar", value)}
          label="Upload Photo"
          fallback={getInitials()}
          size="lg"
        />
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-3 gap-4">
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
          <Label htmlFor="secondName">Second name (optional)</Label>
          <Input
            id="secondName"
            placeholder="Enter second name"
            value={data.secondName}
            onChange={(e) => updateField("secondName", e.target.value)}
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

      {/* Nationality */}
      <div className="space-y-2">
        <Label>Nationality</Label>
        <CountrySelect
          value={data.nationality}
          onValueChange={(value) => updateField("nationality", value)}
          placeholder="Select nationality"
        />
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

      {/* Mobile number */}
      <div className="space-y-2">
        <Label>Mobile number (optional)</Label>
        <PhoneInput
          countryCode={data.mobileCountryCode}
          phoneNumber={data.mobileNumber}
          onCountryCodeChange={(code) => updateField("mobileCountryCode", code)}
          onPhoneNumberChange={(number) => updateField("mobileNumber", number)}
          placeholder="Enter mobile number"
        />
      </div>

      {/* Office number */}
      <div className="space-y-2">
        <Label>Office number (optional)</Label>
        <PhoneInput
          countryCode={data.officeCountryCode}
          phoneNumber={data.officeNumber}
          onCountryCodeChange={(code) => updateField("officeCountryCode", code)}
          onPhoneNumberChange={(number) => updateField("officeNumber", number)}
          placeholder="Enter office number"
        />
      </div>
    </div>
  );
}
