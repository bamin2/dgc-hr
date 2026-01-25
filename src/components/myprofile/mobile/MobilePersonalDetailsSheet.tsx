import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/hooks/employee/types';
import { useUpdateEmployee } from '@/hooks/useEmployees';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader2, Mail, Phone, MapPin, User, Heart, Calendar, Globe } from 'lucide-react';

interface MobilePersonalDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
}

export function MobilePersonalDetailsSheet({
  open,
  onOpenChange,
  employee,
}: MobilePersonalDetailsSheetProps) {
  const updateEmployee = useUpdateEmployee();
  
  const [mobilePhone, setMobilePhone] = useState(employee.phone || '');
  const [officePhone, setOfficePhone] = useState(employee.officePhone || '');
  const [address, setAddress] = useState(employee.address || '');
  const [emergencyName, setEmergencyName] = useState(employee.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(employee.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(employee.emergencyContact?.relationship || '');
  
  const hasChanges = 
    mobilePhone !== (employee.phone || '') ||
    officePhone !== (employee.officePhone || '') ||
    address !== (employee.address || '') ||
    emergencyName !== (employee.emergencyContact?.name || '') ||
    emergencyPhone !== (employee.emergencyContact?.phone || '') ||
    emergencyRelation !== (employee.emergencyContact?.relationship || '');

  const handleSave = async () => {
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        phone: mobilePhone || null,
        office_phone: officePhone || null,
        address: address || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        emergency_contact_relationship: emergencyRelation || null,
      });
      toast.success('Personal details updated');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update details');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pr-12">
          <DrawerTitle>Personal Details</DrawerTitle>
        </DrawerHeader>
        
        <DrawerBody className="space-y-6">
          {/* Read-only Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm truncate">{employee.email}</p>
              </div>
            </div>
            
            {employee.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm">{format(new Date(employee.dateOfBirth), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            )}
            
            {employee.nationality && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="text-sm">{employee.nationality}</p>
                </div>
              </div>
            )}
            
            {employee.gender && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm capitalize">{employee.gender}</p>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Editable Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="mobile-phone" className="text-xs">Mobile Phone</Label>
                <Input
                  id="mobile-phone"
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="office-phone" className="text-xs">Office Phone</Label>
                <Input
                  id="office-phone"
                  type="tel"
                  value={officePhone}
                  onChange={(e) => setOfficePhone(e.target.value)}
                  placeholder="+966 1x xxx xxxx"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Home Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
              />
            </div>
          </div>
          
          <Separator />
          
          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Emergency Contact
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergency-name" className="text-xs">Name</Label>
                <Input
                  id="emergency-name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="emergency-phone" className="text-xs">Phone</Label>
                <Input
                  id="emergency-phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+966 5x xxx xxxx"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="emergency-relation" className="text-xs">Relationship</Label>
                <Input
                  id="emergency-relation"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>
          </div>
        </DrawerBody>
        
        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateEmployee.isPending}
            className="w-full h-12"
          >
            {updateEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
