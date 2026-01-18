import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Trash2 } from "lucide-react";
import { WorkLocation, GosiNationalityRate, useUpdateWorkLocation } from "@/hooks/useWorkLocations";
import { toast } from "sonner";
import { countries, getCountryByCode } from "@/data/countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationGeneralSettingsProps {
  workLocation: WorkLocation;
}

// Helper to normalize rate from old (percentage) or new (employeeRate/employerRate) format
function normalizeRate(rate: any): GosiNationalityRate {
  return {
    nationality: rate.nationality,
    employeeRate: rate.employeeRate ?? rate.percentage ?? 0,
    employerRate: rate.employerRate ?? 0,
  };
}

export function LocationGeneralSettings({ workLocation }: LocationGeneralSettingsProps) {
  const [gosiEnabled, setGosiEnabled] = useState(workLocation.gosi_enabled);
  const [gosiBaseCalculation, setGosiBaseCalculation] = useState(
    workLocation.gosi_base_calculation || 'gosi_registered_salary'
  );
  const [nationalityRates, setNationalityRates] = useState<GosiNationalityRate[]>(
    (workLocation.gosi_nationality_rates || []).map(normalizeRate)
  );
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [newNationality, setNewNationality] = useState("");
  const [newEmployeeRate, setNewEmployeeRate] = useState("9.75");
  const [newEmployerRate, setNewEmployerRate] = useState("11.75");
  
  const updateLocation = useUpdateWorkLocation();

  // Get list of nationalities not yet added
  const availableNationalities = countries.filter(
    (c) => !nationalityRates.some((r) => r.nationality === c.code)
  );

  const handleGosiToggle = async (enabled: boolean) => {
    setGosiEnabled(enabled);
    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: enabled,
        gosi_nationality_rates: nationalityRates,
        gosi_base_calculation: gosiBaseCalculation,
      });
      toast.success(`GOSI deduction ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      setGosiEnabled(!enabled);
      toast.error("Failed to update GOSI settings");
    }
  };

  const handleAddNationality = async () => {
    if (!newNationality) return;
    
    const employeeRate = parseFloat(newEmployeeRate);
    const employerRate = parseFloat(newEmployerRate);
    
    if (isNaN(employeeRate) || employeeRate < 0 || employeeRate > 100) {
      toast.error("Please enter a valid employee rate between 0 and 100");
      return;
    }
    if (isNaN(employerRate) || employerRate < 0 || employerRate > 100) {
      toast.error("Please enter a valid employer rate between 0 and 100");
      return;
    }

    const newRates = [...nationalityRates, { nationality: newNationality, employeeRate, employerRate }];
    setNationalityRates(newRates);
    setAddPopoverOpen(false);
    setNewNationality("");
    setNewEmployeeRate("9.75");
    setNewEmployerRate("11.75");

    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: gosiEnabled,
        gosi_nationality_rates: newRates,
        gosi_base_calculation: gosiBaseCalculation,
      });
      toast.success("Nationality added");
    } catch (error) {
      setNationalityRates(nationalityRates);
      toast.error("Failed to add nationality");
    }
  };

  const handleRemoveNationality = async (nationalityCode: string) => {
    const newRates = nationalityRates.filter((r) => r.nationality !== nationalityCode);
    setNationalityRates(newRates);

    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: gosiEnabled,
        gosi_nationality_rates: newRates,
        gosi_base_calculation: gosiBaseCalculation,
      });
      toast.success("Nationality removed");
    } catch (error) {
      setNationalityRates(nationalityRates);
      toast.error("Failed to remove nationality");
    }
  };

  const handleRateChange = async (nationalityCode: string, field: 'employeeRate' | 'employerRate', newValue: string) => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value < 0 || value > 100) return;

    const newRates = nationalityRates.map((r) =>
      r.nationality === nationalityCode ? { ...r, [field]: value } : r
    );
    setNationalityRates(newRates);
  };

  const handleRateBlur = async (nationalityCode: string) => {
    const rate = nationalityRates.find((r) => r.nationality === nationalityCode);
    const originalRates = (workLocation.gosi_nationality_rates || []).map(normalizeRate);
    const originalRate = originalRates.find((r) => r.nationality === nationalityCode);
    
    if (
      rate?.employeeRate === originalRate?.employeeRate &&
      rate?.employerRate === originalRate?.employerRate
    ) return;

    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: gosiEnabled,
        gosi_nationality_rates: nationalityRates,
        gosi_base_calculation: gosiBaseCalculation,
      });
      toast.success("GOSI rates updated");
    } catch (error) {
      setNationalityRates((workLocation.gosi_nationality_rates || []).map(normalizeRate));
      toast.error("Failed to update GOSI rates");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          General Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`gosi-toggle-${workLocation.id}`}>GOSI Deduction</Label>
            <p className="text-sm text-muted-foreground">
              Enable social insurance deductions for employees in this location.
            </p>
          </div>
          <Switch
            id={`gosi-toggle-${workLocation.id}`}
            checked={gosiEnabled}
            onCheckedChange={handleGosiToggle}
            disabled={updateLocation.isPending}
          />
        </div>

        {gosiEnabled && (
          <div className="space-y-4 pt-2 border-t">
            {/* GOSI Base Calculation Method */}
            <div className="space-y-2">
              <Label>GOSI Base Calculation</Label>
              <p className="text-sm text-muted-foreground">
                Choose how the GOSI base amount is calculated for employees.
              </p>
              <Select
                value={gosiBaseCalculation}
                onValueChange={async (value: 'gosi_registered_salary' | 'basic_plus_housing') => {
                  setGosiBaseCalculation(value);
                  try {
                    await updateLocation.mutateAsync({
                      id: workLocation.id,
                      name: workLocation.name,
                      gosi_enabled: gosiEnabled,
                      gosi_nationality_rates: nationalityRates,
                      gosi_base_calculation: value,
                    });
                    toast.success("GOSI calculation method updated");
                  } catch (error) {
                    setGosiBaseCalculation(workLocation.gosi_base_calculation || 'gosi_registered_salary');
                    toast.error("Failed to update GOSI calculation method");
                  }
                }}
                disabled={updateLocation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gosi_registered_salary">
                    GOSI Registered Salary
                  </SelectItem>
                  <SelectItem value="basic_plus_housing">
                    Basic Salary + Housing Allowance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Nationality Rates</Label>
              <p className="text-sm text-muted-foreground">
                Set GOSI employee deduction and employer contribution rates for each applicable nationality.
              </p>
            </div>

            {nationalityRates.length > 0 && (
              <div className="space-y-2">
                {nationalityRates.map((rate) => {
                  const country = getCountryByCode(rate.nationality);
                  return (
                    <div
                      key={rate.nationality}
                      className="flex flex-col gap-3 p-3 rounded-md border bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{country?.flag}</span>
                          <span className="text-sm font-medium truncate">
                            {country?.name || rate.nationality}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveNationality(rate.nationality)}
                          disabled={updateLocation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Employee Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={rate.employeeRate}
                              onChange={(e) =>
                                handleRateChange(rate.nationality, 'employeeRate', e.target.value)
                              }
                              onBlur={() => handleRateBlur(rate.nationality)}
                              disabled={updateLocation.isPending}
                              className="w-full text-right"
                            />
                            <span className="text-muted-foreground text-sm">%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Employer Rate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={rate.employerRate}
                              onChange={(e) =>
                                handleRateChange(rate.nationality, 'employerRate', e.target.value)
                              }
                              onBlur={() => handleRateBlur(rate.nationality)}
                              disabled={updateLocation.isPending}
                              className="w-full text-right"
                            />
                            <span className="text-muted-foreground text-sm">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={availableNationalities.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  Add Nationality
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Select value={newNationality} onValueChange={setNewNationality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableNationalities.map((country) => (
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
                  <div className="space-y-2">
                    <Label>Employee Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">Deducted from employee's salary</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newEmployeeRate}
                        onChange={(e) => setNewEmployeeRate(e.target.value)}
                        className="text-right"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Employer Rate (%)</Label>
                    <p className="text-xs text-muted-foreground">Employer contribution (display only)</p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newEmployerRate}
                        onChange={(e) => setNewEmployerRate(e.target.value)}
                        className="text-right"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddNationality}
                    disabled={!newNationality || updateLocation.isPending}
                    className="w-full"
                  >
                    Add
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <p className="text-xs text-muted-foreground">
              Employees can be excluded individually via their profile toggle.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
