import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, AlertTriangle, User, Globe } from 'lucide-react';
import { Employee, useUpdateEmployee } from '@/hooks/useEmployees';
import { EditableField } from './EditableField';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
    ? format(new Date(employee.dateOfBirth), 'MMMM d, yyyy')
    : '';

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              label="Phone"
              value={employee.phone}
              onSave={(value) => handleSaveField('phone', value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <EditableField
            label="Address"
            value={employee.address || ''}
            onSave={(value) => handleSaveField('address', value)}
            placeholder="Enter your address"
            multiline
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Date of Birth</label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Read-only
                </span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-md min-h-[40px]">
                <span className={`text-sm ${dateOfBirth ? '' : 'text-muted-foreground'}`}>
                  {dateOfBirth || 'Not set'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Nationality</label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Read-only
                </span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-md min-h-[40px]">
                <span className={`text-sm ${employee.nationality ? '' : 'text-muted-foreground'}`}>
                  {employee.nationality || 'Not set'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Read-only
                </span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-md min-h-[40px]">
                <span className={`text-sm ${employee.gender ? '' : 'text-muted-foreground'} capitalize`}>
                  {employee.gender || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}