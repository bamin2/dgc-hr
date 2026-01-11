import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send, Save, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDepartmentsManagement } from "@/hooks/useDepartmentsManagement";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { usePositionsManagement } from "@/hooks/usePositionsManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { useUpdateOfferVersion, useReviseOffer, useSendOfferLetter, useAcceptOffer, useRejectOffer } from "@/hooks/useOffers";
import type { OfferVersion } from "@/hooks/useOffers";
import { toast } from "sonner";

interface OfferVersionEditorProps {
  version: OfferVersion;
  offerId: string;
  candidateId: string;
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

export function OfferVersionEditor({ version, offerId, candidateId }: OfferVersionEditorProps) {
  const { data: departments } = useDepartmentsManagement();
  const { data: workLocations } = useWorkLocations();
  const { data: positions } = usePositionsManagement();
  const { data: employees } = useEmployees();
  
  const updateVersion = useUpdateOfferVersion();
  const reviseOffer = useReviseOffer();
  const sendOfferLetter = useSendOfferLetter();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  const isReadOnly = version.status !== 'draft';

  const [formData, setFormData] = useState({
    work_location_id: version.work_location_id || "",
    department_id: version.department_id || "",
    position_id: version.position_id || "",
    manager_employee_id: version.manager_employee_id || "",
    start_date: version.start_date || "",
    currency_code: version.currency_code || "BHD",
    basic_salary: version.basic_salary || 0,
    housing_allowance: version.housing_allowance || 0,
    transport_allowance: version.transport_allowance || 0,
    other_allowances: version.other_allowances || 0,
    deductions_fixed: version.deductions_fixed || 0,
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
      currency_code: version.currency_code || "BHD",
      basic_salary: version.basic_salary || 0,
      housing_allowance: version.housing_allowance || 0,
      transport_allowance: version.transport_allowance || 0,
      other_allowances: version.other_allowances || 0,
      deductions_fixed: version.deductions_fixed || 0,
      remarks_internal: version.remarks_internal || "",
      change_reason: version.change_reason || "",
    });
  }, [version]);

  const grossPayTotal = 
    Number(formData.basic_salary) + 
    Number(formData.housing_allowance) + 
    Number(formData.transport_allowance) + 
    Number(formData.other_allowances);

  const netPayEstimate = grossPayTotal - Number(formData.deductions_fixed);

  const handleSave = async () => {
    try {
      await updateVersion.mutateAsync({
        versionId: version.id,
        data: {
          ...formData,
          gross_pay_total: grossPayTotal,
          net_pay_estimate: netPayEstimate,
        },
      });
      toast.success("Version saved");
    } catch (error) {
      toast.error("Failed to save version");
    }
  };

  const handleSendOffer = async () => {
    try {
      await sendOfferLetter.mutateAsync(version.id);
      toast.success("Offer letter sent");
    } catch (error) {
      toast.error("Failed to send offer letter");
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
      await acceptOffer.mutateAsync(version.id);
      toast.success("Offer marked as accepted");
    } catch (error) {
      toast.error("Failed to accept offer");
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
                <>
                  <Button variant="outline" onClick={handleSave} disabled={updateVersion.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleSendOffer} disabled={sendOfferLetter.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Offer
                  </Button>
                </>
              )}
              {version.status === 'sent' && (
                <>
                  <Button variant="outline" onClick={handleRevise} disabled={reviseOffer.isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revise Offer
                  </Button>
                  <Button variant="outline" onClick={handleAccept} disabled={acceptOffer.isPending} className="text-green-600 hover:text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
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

            <div className="space-y-2">
              <Label>Fixed Deductions</Label>
              <Input 
                type="number" 
                value={formData.deductions_fixed} 
                onChange={(e) => setFormData(p => ({ ...p, deductions_fixed: Number(e.target.value) }))}
                disabled={isReadOnly}
              />
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
