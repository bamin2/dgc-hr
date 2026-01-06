import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { countries, getCountryByCode } from "@/data/countries";

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder = "Enter phone number",
  disabled = false,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = getCountryByCode(countryCode);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[140px] justify-between shrink-0"
            disabled={disabled}
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2 truncate">
                <span>{selectedCountry.flag}</span>
                <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select</span>
            )}
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dialCode}`}
                    onSelect={() => {
                      onCountryCodeChange(country.code);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        countryCode === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{country.flag}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    <span className="text-muted-foreground ml-2">{country.dialCode}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value)}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}
