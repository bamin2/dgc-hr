import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RefreshCw, CheckCircle, XCircle, CalendarIcon, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations, GosiNationalityRate } from "@/hooks/useWorkLocations";
import { usePositionsManagement } from "@/hooks/usePositionsManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateOfferVersionFromEdit, useReviseOffer, useAcceptOffer, useRejectOffer } from "@/hooks/useOffers";
import type { OfferVersion, Candidate } from "@/hooks/useOffers";
import { toast } from "sonner";
import { getCountryCodeByName } from "@/data/countries";

interface OfferVersionEditorProps {
  version: OfferVersion;
  offerId: string;
  candidateId: string;
  candidateNationality?: string | null;
}

const CURRENCIES = [
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "USD", name: "US Dollar" },
];

export function OfferVersionEditor({ version, offerId, candidateId, candidateNationality }: OfferVersionEditorProps) {
  const navigate = useNavigate();
  const { data: departments } = useDepartmentsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: positions } = usePositionsManagement();
  const { data: employees } = useEmployees();
  const { profile } = useAuth();
  
  const createNewVersion = useCreateOfferVersionFromEdit();
  const reviseOffer = useReviseOffer();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  const isReadOnly = version.status !== 'draft';

  const [formData, setFormData] = useState({
    work_location_id: version.work_location_id || "",
    department_id: version.department_id || "",
    position_id: version.position_id || "",
    manager_employee_id: version.manager_employee_id || "",
    start_date: version.start_date || "",
    offer_expiry_date: version.offer_expiry_date || "",
    currency_code: version.currency_code || "BHD",
    basic_salary: version.basic_salary || 0,
    housing_allowance: version.housing_allowance || 0,
    transport_allowance: version.transport_allowance || 0,
    other_allowances: version.other_allowances || 0,
    is_subject_to_gosi: version.is_subject_to_gosi ?? false,
    other_deductions: version.other_deductions || 0,
    remarks_internal: version.remarks_internal || "",
    change_reason: version.change_reason || "",
  });

  useEffect(() => {
    setFormData({
      work_location_id: version.work_location_id || "",
      department_id: version.department_id || "",
      position_id: version.position_id || "",
      manager_employee_id: version.manager_employee_id || "",
      start_date: version.start_date || "",
      offer_expiry_date: version.offer_expiry_date || "",
      currency_code: version.currency_code || "BHD",
      basic_salary: version.basic_salary || 0,
      housing_allowance: version.housing_allowance || 0,
      transport_allowance: version.transport_allowance || 0,
      other_allowances: version.other_allowances || 0,
      is_subject_to_gosi: version.is_subject_to_gosi ?? false,
      other_deductions: version.other_deductions || 0,
      remarks_internal: version.remarks_internal || "",
      change_reason: version.change_reason || "",
    });
  }, [version]);

  // Get selected work location for GOSI rates
  const selectedWorkLocation = useMemo(() => {
    return workLocations?.find(l => l.id === formData.work_location_id);
  }, [workLocations, formData.work_location_id]);

  // Calculate GOSI based on work location rates and candidate nationality
  const gosiCalculation = useMemo(() => {
    if (!formData.is_subject_to_gosi || !selectedWorkLocation?.gosi_enabled) {
      return { employeeAmount: 0, employerAmount: 0 };
    }

    // GOSI base = Basic Salary + All Allowances
    const gosiBase = formData.basic_salary + formData.housing_allowance + 
                     formData.transport_allowance + formData.other_allowances;

    const rates = selectedWorkLocation.gosi_nationality_rates || [];
    const nationalityCode = candidateNationality ? getCountryCodeByName(candidateNationality) : '';
    
    // Find matching rate for nationality
    const matchingRate = rates.find(r => 
      r.nationality.toLowerCase() === nationalityCode?.toLowerCase() ||
      r.nationality.toLowerCase() === candidateNationality?.toLowerCase()
    );

    if (matchingRate) {
      return {
        employeeAmount: (gosiBase * matchingRate.employeeRate) / 100,
        employerAmount: (gosiBase * matchingRate.employerRate) / 100,
      };
    }

    // Default rates if no matching nationality found
    return {
      employeeAmount: gosiBase * 0.0975, // 9.75% default employee rate
      employerAmount: gosiBase * 0.1175, // 11.75% default employer rate
    };
  }, [formData, selectedWorkLocation, candidateNationality]);

  // Calculate totals
  const grossPayTotal = 
    Number(formData.basic_salary) + 
    Number(formData.housing_allowance) + 
    Number(formData.transport_allowance) + 
    Number(formData.other_allowances);

  const totalDeductions = gosiCalculation.employeeAmount + Number(formData.other_deductions);
  const netPayEstimate = grossPayTotal - totalDeductions;

  const handleSave = async () => {
    try {
      // Prepare data without generated columns
      const updateData = {
        work_location_id: formData.work_location_id || null,
        department_id: formData.department_id || null,
        position_id: formData.position_id || null,
        manager_employee_id: formData.manager_employee_id || null,
        start_date: formData.start_date || null,
        offer_expiry_date: formData.offer_expiry_date || null,
        currency_code: formData.currency_code,
        basic_salary: formData.basic_salary,
        housing_allowance: formData.housing_allowance,
        transport_allowance: formData.transport_allowance,
        other_allowances: formData.other_allowances,
        is_subject_to_gosi: formData.is_subject_to_gosi,
        gosi_employee_amount: gosiCalculation.employeeAmount,
        employer_gosi_amount: gosiCalculation.employerAmount,
        other_deductions: formData.other_deductions,
        deductions_fixed: totalDeductions,
        deductions_total: totalDeductions,
        remarks_internal: formData.remarks_internal || null,
        change_reason: formData.change_reason || null,
      };

      // Create a new version instead of updating in place
      await createNewVersion.mutateAsync({
        offerId,
        previousVersionId: version.id,
        data: updateData,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save version");
    }
  };

  const handleRevise = async () => {
    try {
      await reviseOffer.mutateAsync({ offerId, copyFromVersionId: version.id });
      toast.success("New version created");
    } catch (error) {
      toast.error("Failed to create new version");
    }
  };

  const handleAccept = async () => {
    try {
      const result = await acceptOffer.mutateAsync(version.id);
      toast.success("Offer accepted and employee created successfully");
      navigate(`/employees/${result.employeeId}`);
    } catch (error) {
      console.error("Accept offer error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.message || JSON.stringify(error);
      toast.error(`Failed to accept offer: ${errorMessage}`);
    }
  };

  const handleReject = async () => {
    try {
      await rejectOffer.mutateAsync(version.id);
      toast.success("Offer marked as rejected");
    } catch (error) {
      toast.error("Failed to reject offer");
    }
  };

  const getStatusBadge = () => {
    switch (version.status) {
      case 'draft':
        return <Badge variant="outline" className="bg-muted">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500">Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'superseded':
        return <Badge variant="outline" className="text-muted-foreground">Superseded</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-orange-500">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Version Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Version {version.version_number}</CardTitle>
              {getStatusBadge()}
            </div>
            <div className="flex gap-2 flex-wrap">
              {version.status === 'draft' && (
                <Button variant="outline" onClick={handleSave} disabled={createNewVersion.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
              {version.status === 'sent' && (
                <>
                  <Button variant="outline" onClick={handleRevise} disabled={reviseOffer.isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revise Offer
                  </Button>
                  <Button onClick={handleAccept} disabled={acceptOffer.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {acceptOffer.isPending ? "Converting..." : "Accept & Convert to Employee"}
                  </Button>
                  <Button variant="outline" onClick={handleReject} disabled={rejectOffer.isPending} className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Work Location</Label>
            <Select 
              value={formData.work_location_id} 
              onValueChange={(v) => setFormData(p => ({ ...p, work_location_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {workLocations?.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select 
              value={formData.department_id} 
              onValueChange={(v) => setFormData(p => ({ ...p, department_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Select 
              value={formData.position_id} 
              onValueChange={(v) => setFormData(p => ({ ...p, position_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
              <SelectContent>
                {positions?.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Manager</Label>
            <Select 
              value={formData.manager_employee_id} 
              onValueChange={(v) => setFormData(p => ({ ...p, manager_employee_id: v }))}
              disabled={isReadOnly}
            >
              <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent>
                {employees?.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input 
              type="date" 
              value={formData.start_date} 
              onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Offer Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.offer_expiry_date && "text-muted-foreground"
                  )}
                  disabled={isReadOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.offer_expiry_date 
                    ? format(new Date(formData.offer_expiry_date), "PPP") 
                    : "Select expiry date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.offer_expiry_date ? new Date(formData.offer_expiry_date) : undefined}
                  onSelect={(date) => setFormData(p => ({ 
                    ...p, 
                    offer_expiry_date: date ? format(date, "yyyy-MM-dd") : "" 
                  }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compensation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={formData.currency_code} 
                onValueChange={(v) => setFormData(p => ({ ...p, currency_code: v }))}
                disabled={isReadOnly}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Basic Salary</Label>
              <Input 
                type="number" 
                value={formData.basic_salary} 
                onChange={(e) => setFormData(p => ({ ...p, basic_salary: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Housing Allowance</Label>
              <Input 
                type="number" 
                value={formData.housing_allowance} 
                onChange={(e) => setFormData(p => ({ ...p, housing_allowance: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Transport Allowance</Label>
              <Input 
                type="number" 
                value={formData.transport_allowance} 
                onChange={(e) => setFormData(p => ({ ...p, transport_allowance: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label>Other Allowances</Label>
              <Input 
                type="number" 
                value={formData.other_allowances} 
                onChange={(e) => setFormData(p => ({ ...p, other_allowances: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <Separator />

          {/* GOSI Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Subject to GOSI</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedWorkLocation?.gosi_enabled 
                    ? "GOSI is enabled for this work location" 
                    : "GOSI is not enabled for this work location"}
                </p>
              </div>
              <Switch
                checked={formData.is_subject_to_gosi}
                onCheckedChange={(checked) => setFormData(p => ({ ...p, is_subject_to_gosi: checked }))}
                disabled={isReadOnly || !selectedWorkLocation?.gosi_enabled}
              />
            </div>

            {formData.is_subject_to_gosi && selectedWorkLocation?.gosi_enabled && (
              <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">GOSI Employee Deduction</Label>
                  <p className="text-lg font-semibold">
                    {formData.currency_code} {gosiCalculation.employeeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Auto-calculated from gross salary</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">GOSI Employer Contribution</Label>
                  <p className="text-lg font-semibold">
                    {formData.currency_code} {gosiCalculation.employerAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Employer's share (not deducted from salary)</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Other Deductions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Other Deductions</Label>
              <Input 
                type="number" 
                value={formData.other_deductions} 
                onChange={(e) => setFormData(p => ({ ...p, other_deductions: Number(e.target.value) }))}
                disabled={isReadOnly}
                placeholder="Non-GOSI deductions"
              />
              <p className="text-xs text-muted-foreground">Deductions not related to GOSI</p>
            </div>
            <div className="space-y-2">
              <Label>Total Deductions</Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                <span className="font-medium">
                  {formData.currency_code} {totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">GOSI + Other deductions</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Gross Pay Total</p>
              <p className="text-2xl font-bold text-primary">
                {formData.currency_code} {grossPayTotal.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Net Pay Estimate</p>
              <p className="text-2xl font-bold">
                {formData.currency_code} {netPayEstimate.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Internal Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Change Reason (for this version)</Label>
            <Input 
              value={formData.change_reason} 
              onChange={(e) => setFormData(p => ({ ...p, change_reason: e.target.value }))}
              placeholder="e.g., Increased housing allowance per candidate request"
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>Internal Remarks</Label>
            <Textarea 
              value={formData.remarks_internal} 
              onChange={(e) => setFormData(p => ({ ...p, remarks_internal: e.target.value }))}
              placeholder="Notes visible only to HR..."
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
