import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { offerTemplates } from "@/data/team";
import { mockEmployees } from "@/data/employees";

export interface TeamOfferData {
  templateId: string;
  templateTitle: string;
  expirationDate: Date | undefined;
  managerId: string;
  jobTitle: string;
  signatureTitle: string;
  signatureName: string;
  offerContent: string;
}

interface TeamOfferStepProps {
  data: TeamOfferData;
  onChange: (data: TeamOfferData) => void;
  defaultJobTitle: string;
  defaultManagerId: string;
}

const smartTextVariables = [
  "<<Company Name>>",
  "<<Employee Full Name>>",
  "<<Job Title>>",
  "<<Start Date>>",
  "<<Salary>>",
  "<<Manager Name>>",
];

const defaultOfferContent = `Dear <<Employee Full Name>>,

We are pleased to offer you the position of <<Job Title>> at <<Company Name>>. 

Your start date will be <<Start Date>> and your annual compensation will be <<Salary>>.

You will report directly to <<Manager Name>>.

We are excited to have you join our team and look forward to your contributions.

Best regards,
<<Company Name>> HR Team`;

export function TeamOfferStep({
  data,
  onChange,
  defaultJobTitle,
  defaultManagerId,
}: TeamOfferStepProps) {
  const updateField = <K extends keyof TeamOfferData>(
    field: K,
    value: TeamOfferData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const managers = mockEmployees.filter(
    (emp) => emp.position.includes("Manager") || emp.position.includes("Director")
  );

  const selectedManager = managers.find((m) => m.id === (data.managerId || defaultManagerId));

  const insertVariable = (variable: string) => {
    updateField("offerContent", data.offerContent + " " + variable);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Offer letter details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the offer letter template and content
        </p>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <Label>Offer letter template</Label>
        <Select
          value={data.templateId}
          onValueChange={(value) => {
            updateField("templateId", value);
            if (value === "new") {
              updateField("offerContent", defaultOfferContent);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Create new template</SelectItem>
            {offerTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data.templateId === "new" && (
        <div className="space-y-2">
          <Label>New offer template title</Label>
          <Input
            placeholder="Enter template title"
            value={data.templateTitle}
            onChange={(e) => updateField("templateTitle", e.target.value)}
          />
        </div>
      )}

      {/* Expiration Date */}
      <div className="space-y-2">
        <Label>Offer expiration date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.expirationDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.expirationDate ? (
                format(data.expirationDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.expirationDate}
              onSelect={(date) => updateField("expirationDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Manager (Pre-filled) */}
      <div className="space-y-2">
        <Label>Manager</Label>
        <Select
          value={data.managerId || defaultManagerId}
          onValueChange={(value) => updateField("managerId", value)}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedManager && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedManager.avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedManager.firstName[0]}
                      {selectedManager.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {selectedManager.firstName} {selectedManager.lastName}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={manager.avatar} />
                    <AvatarFallback className="text-xs">
                      {manager.firstName[0]}
                      {manager.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {manager.firstName} {manager.lastName}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Title (Pre-filled) */}
      <div className="space-y-2">
        <Label>Job title</Label>
        <Input
          value={data.jobTitle || defaultJobTitle}
          onChange={(e) => updateField("jobTitle", e.target.value)}
        />
      </div>

      {/* Company Signature */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Signature title</Label>
          <Input
            placeholder="e.g., HR Director"
            value={data.signatureTitle}
            onChange={(e) => updateField("signatureTitle", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Signature name</Label>
          <Input
            placeholder="e.g., John Smith"
            value={data.signatureName}
            onChange={(e) => updateField("signatureName", e.target.value)}
          />
        </div>
      </div>

      {/* Smart Text Variables */}
      <div className="space-y-2">
        <Label>Smart text variables</Label>
        <div className="flex flex-wrap gap-2">
          {smartTextVariables.map((variable) => (
            <Button
              key={variable}
              variant="outline"
              size="sm"
              onClick={() => insertVariable(variable)}
              className="text-xs"
            >
              {variable}
            </Button>
          ))}
        </div>
      </div>

      {/* Rich Text Editor (Simplified) */}
      <div className="space-y-2">
        <Label>Offer letter content</Label>
        <div className="border rounded-lg">
          <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={data.offerContent}
            onChange={(e) => updateField("offerContent", e.target.value)}
            placeholder="Enter offer letter content..."
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-t-none"
          />
        </div>
      </div>
    </div>
  );
}
