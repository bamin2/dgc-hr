import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/ui/country-select";
import { cn } from "@/lib/utils";
import { useCreateCandidate, type CandidateFormData } from "@/hooks/useCandidates";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { usePositionsManagement } from "@/hooks/usePositionsManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { getCountryByCode } from "@/data/countries";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  phone_country_code: z.string().optional(),
  nationality: z.string().optional(),
  work_location_id: z.string().optional(),
  department_id: z.string().optional(),
  position_id: z.string().optional(),
  manager_employee_id: z.string().optional(),
  proposed_start_date: z.string().optional(),
  notes: z.string().optional(),
});

interface CandidateFormProps {
  onSuccess: () => void;
}

export function CandidateForm({ onSuccess }: CandidateFormProps) {
  const [dateOpen, setDateOpen] = useState(false);
  const createCandidate = useCreateCandidate();
  const { data: departments } = useDepartmentsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: positions } = usePositionsManagement();
  const { data: employees } = useEmployees();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CandidateFormData & { phone_country_code?: string }>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', phone_country_code: 'SA' },
  });

  const onSubmit = async (data: CandidateFormData & { phone_country_code?: string }) => {
    // Combine country dial code with phone number for storage
    const countryCode = data.phone_country_code || 'SA';
    const country = getCountryByCode(countryCode);
    const fullPhone = data.phone && country ? `${country.dialCode} ${data.phone}` : data.phone;
    
    const { phone_country_code, ...candidateData } = data;
    await createCandidate.mutateAsync({ ...candidateData, phone: fullPhone });
    onSuccess();
  };

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

      <div className="space-y-2">
        <Label>Work Location</Label>
        <Select onValueChange={(v) => setValue("work_location_id", v)} value={watch("work_location_id")}>
          <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
          <SelectContent>
            {workLocations?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Department</Label>
        <Select onValueChange={(v) => setValue("department_id", v)} value={watch("department_id")}>
          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
          <SelectContent>
            {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        <Select onValueChange={(v) => setValue("position_id", v)} value={watch("position_id")}>
          <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
          <SelectContent>
            {positions?.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Manager</Label>
        <Select onValueChange={(v) => setValue("manager_employee_id", v)} value={watch("manager_employee_id")}>
          <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
          <SelectContent>
            {employees?.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Proposed Start Date</Label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !watch("proposed_start_date") && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watch("proposed_start_date")
                ? format(new Date(watch("proposed_start_date")), "PPP")
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watch("proposed_start_date") ? new Date(watch("proposed_start_date")) : undefined}
              onSelect={(date) => {
                setValue("proposed_start_date", date ? format(date, "yyyy-MM-dd") : "");
                setDateOpen(false);
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={createCandidate.isPending}>
          {createCandidate.isPending ? "Creating..." : "Create Candidate"}
        </Button>
      </div>
    </form>
  );
}
