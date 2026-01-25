import { CardTitle } from '@/components/ui/card';
import { Phone, AlertTriangle, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee, useUpdateEmployee } from '@/hooks/useEmployees';
import { EditableField } from './EditableField';
import { toast } from 'sonner';
import { formatLongDate } from "@/lib/dateUtils";
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

interface MyProfilePersonalTabProps {
  employee: Employee;
}

export function MyProfilePersonalTab({ employee }: MyProfilePersonalTabProps) {
  const updateEmployee = useUpdateEmployee();

  const handleSaveField = async (field: string, value: string) => {
    try {
      const updateData: Record<string, unknown> = { id: employee.id };
      
      if (field === 'phone') {
        updateData.phone = value;
      } else if (field === 'officePhone') {
        updateData.office_phone = value;
      } else if (field === 'address') {
        updateData.address = value;
      } else if (field === 'emergencyContactName') {
        updateData.emergency_contact_name = value;
      } else if (field === 'emergencyContactPhone') {
        updateData.emergency_contact_phone = value;
      } else if (field === 'emergencyContactRelationship') {
        updateData.emergency_contact_relationship = value;
      }
      
      await updateEmployee.mutateAsync(updateData as any);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const dateOfBirth = employee.dateOfBirth 
    ? formatLongDate(employee.dateOfBirth)
    : '';

  return (
    <BentoGrid noPadding>
      {/* Contact Information */}
      <BentoCard colSpan={8}>
        <CardTitle className="text-base font-medium flex items-center gap-2 mb-4">
          <Phone className="h-4 w-4 text-primary" />
          Contact Information
        </CardTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Email</label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Read-only
                </span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-md">
                <span className="text-sm">{employee.email}</span>
              </div>
            </div>
            
            <EditableField
              label="Mobile"
              value={employee.phone}
              onSave={(value) => handleSaveField('phone', value)}
              placeholder="Enter mobile number"
            />
            
            <EditableField
              label="Office"
              value={employee.officePhone || ''}
              onSave={(value) => handleSaveField('officePhone', value)}
              placeholder="Enter office number"
            />
          </div>
          
          <EditableField
            label="Address"
            value={employee.address || ''}
            onSave={(value) => handleSaveField('address', value)}
            placeholder="Enter your address"
            multiline
          />
        </div>
      </BentoCard>

      {/* Personal Information */}
      <BentoCard colSpan={4}>
        {/* Header with single Read-only indicator */}
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span className="text-xs">Read-only</span>
          </div>
        </div>
        
        {/* Mini Bento Tiles - 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date of Birth Tile */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
            <p className={cn(
              "text-sm font-medium",
              !dateOfBirth && "text-muted-foreground"
            )}>
              {dateOfBirth || 'Not set'}
            </p>
          </div>
          
          {/* Nationality Tile */}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Nationality</p>
            <p className={cn(
              "text-sm font-medium",
              !employee.nationality && "text-muted-foreground"
            )}>
              {employee.nationality || 'Not set'}
            </p>
          </div>
          
          {/* Gender Tile - spans full width for balance */}
          <div className="bg-muted/30 rounded-xl p-4 sm:col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Gender</p>
            <p className={cn(
              "text-sm font-medium capitalize",
              !employee.gender && "text-muted-foreground"
            )}>
              {employee.gender || 'Not set'}
            </p>
          </div>
        </div>
      </BentoCard>

      {/* Emergency Contact */}
      <BentoCard colSpan={12}>
        <CardTitle className="text-base font-medium flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Emergency Contact
        </CardTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditableField
              label="Contact Name"
              value={employee.emergencyContact?.name || ''}
              onSave={(value) => handleSaveField('emergencyContactName', value)}
              placeholder="Enter emergency contact name"
            />
            
            <EditableField
              label="Contact Phone"
              value={employee.emergencyContact?.phone || ''}
              onSave={(value) => handleSaveField('emergencyContactPhone', value)}
              placeholder="Enter emergency contact phone"
            />
          </div>
          
          <EditableField
            label="Relationship"
            value={employee.emergencyContact?.relationship || ''}
            onSave={(value) => handleSaveField('emergencyContactRelationship', value)}
            placeholder="e.g., Spouse, Parent, Sibling"
          />
        </div>
      </BentoCard>
    </BentoGrid>
  );
}
