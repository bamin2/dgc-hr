import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/ui/country-select";
import { useCreateCandidate, useUpdateCandidate, type Candidate } from "@/hooks/useCandidates";
import { getCountryByCode, countries } from "@/data/countries";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  phone_country_code: z.string().optional(),
  nationality: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CandidateFormProps {
  onSuccess: () => void;
  candidate?: Candidate | null;
}

// Parse phone number like "+966 123456789" to extract country code and number
function parsePhoneNumber(phone: string | null | undefined): { countryCode: string; number: string } {
  if (!phone) return { countryCode: 'SA', number: '' };
  const match = phone.match(/^(\+\d+(?:-\d+)?)\s*(.*)$/);
  if (match) {
    const dialCode = match[1];
    const country = countries.find(c => c.dialCode === dialCode);
    return { countryCode: country?.code || 'SA', number: match[2] };
  }
  return { countryCode: 'SA', number: phone };
}

export function CandidateForm({ onSuccess, candidate }: CandidateFormProps) {
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const isEditMode = !!candidate;

  const parsedPhone = parsePhoneNumber(candidate?.phone);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: candidate ? {
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email,
      phone: parsedPhone.number,
      phone_country_code: parsedPhone.countryCode,
      nationality: candidate.nationality || '',
    } : { 
      phone_country_code: 'SA' 
    },
  });

  const onSubmit = async (data: FormData) => {
    const countryCode = data.phone_country_code || 'SA';
    const country = getCountryByCode(countryCode);
    const fullPhone = data.phone && country ? `${country.dialCode} ${data.phone}` : data.phone;
    
    const candidateData = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: fullPhone,
      nationality: data.nationality,
    };

    if (isEditMode && candidate) {
      await updateCandidate.mutateAsync({ id: candidate.id, data: candidateData });
    } else {
      await createCandidate.mutateAsync(candidateData);
    }
    onSuccess();
  };

  const isPending = createCandidate.isPending || updateCandidate.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <PhoneInput
          countryCode={watch("phone_country_code") || "SA"}
          phoneNumber={watch("phone") || ""}
          onCountryCodeChange={(code) => setValue("phone_country_code", code)}
          onPhoneNumberChange={(number) => setValue("phone", number)}
        />
      </div>

      <div className="space-y-2">
        <Label>Nationality</Label>
        <CountrySelect
          value={watch("nationality") || ""}
          onValueChange={(value) => setValue("nationality", value)}
          placeholder="Select nationality"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isEditMode 
            ? (updateCandidate.isPending ? "Saving..." : "Save Changes")
            : (createCandidate.isPending ? "Creating..." : "Create Candidate")
          }
        </Button>
      </div>
    </form>
  );
}