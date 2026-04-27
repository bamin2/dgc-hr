import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { HierarchicalCalendar } from "@/components/ui/hierarchical-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CountrySelect } from "@/components/ui/country-select";
import { ImageCropper } from "@/components/ui/image-cropper";
import { Employee, useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useUpdateEmployeeMutation } from "@/hooks/employee/mutations";
import { toast } from "@/hooks/use-toast";
import { wouldCreateCircularReference, isInactiveEmployee } from "@/utils/orgHierarchy";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: Partial<Employee>) => void;
}

interface FormData {
  firstName: string;
  secondName: string;
  lastName: string;
  email: string;
  phone: string;
  mobileCountryCode: string;
  officePhone: string;
  officeCountryCode: string;
  department: string;
  departmentId: string;
  position: string;
  positionId: string;
  status: Employee["status"];
  dateOfBirth: string;
  gender: string;
  address: string;
  nationality: string;
  avatar: string;
  managerId: string;
  passportNumber: string;
  cprNumber: string;
  joinDate: string;
}

export function EmployeeForm({ open, onOpenChange, employee, onSave }: EmployeeFormProps) {
  const isEditing = !!employee;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: allEmployees = [] } = useEmployees();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const updateEmployee = useUpdateEmployeeMutation();
  
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    secondName: '',
    lastName: '',
    email: '',
    phone: '',
    mobileCountryCode: 'BH',
    officePhone: '',
    officeCountryCode: 'BH',
    department: '',
    departmentId: '',
    position: '',
    positionId: '',
    status: 'active',
    dateOfBirth: '',
    gender: '',
    address: '',
    nationality: '',
    avatar: '',
    managerId: '',
    passportNumber: '',
    cprNumber: '',
    joinDate: '',
  });

  // Filter potential managers - exclude inactive, self, and employees that would create circular reference
  const potentialManagers = allEmployees.filter((emp) => {
    if (isInactiveEmployee(emp)) return false; // Exclude inactive employees
    if (!employee) return true; // If adding new employee, all active can be managers
    if (emp.id === employee.id) return false; // Can't be own manager
    return !wouldCreateCircularReference(allEmployees, employee.id, emp.id);
  });

  // Update form when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        secondName: employee.secondName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        mobileCountryCode: employee.mobileCountryCode || 'BH',
        officePhone: employee.officePhone || '',
        officeCountryCode: employee.officeCountryCode || 'BH',
        department: employee.department || '',
        departmentId: employee.departmentId || '',
        position: employee.position || '',
        positionId: employee.positionId || '',
        status: employee.status || 'active',
        dateOfBirth: employee.dateOfBirth || '',
        gender: employee.gender || '',
        address: employee.address || '',
        nationality: employee.nationality || '',
        avatar: employee.avatar || '',
        managerId: employee.managerId || '',
        passportNumber: employee.passportNumber || '',
        cprNumber: employee.cprNumber || '',
        joinDate: employee.joinDate || '',
      });
    } else {
      setFormData({
        firstName: '',
        secondName: '',
        lastName: '',
        email: '',
        phone: '',
        mobileCountryCode: 'BH',
        officePhone: '',
        officeCountryCode: 'BH',
        department: '',
        departmentId: '',
        position: '',
        positionId: '',
        status: 'active',
        dateOfBirth: '',
        gender: '',
        address: '',
        nationality: '',
        avatar: '',
        managerId: '',
        passportNumber: '',
        cprNumber: '',
        joinDate: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
    } as Partial<Employee>);
    onOpenChange(false);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const updates: Partial<FormData> = { [field]: value };
      
      // When department changes, update both ID and name
      if (field === 'departmentId' && typeof value === 'string') {
        const dept = departments.find(d => d.id === value);
        if (dept) {
          updates.department = dept.name;
        }
      }
      
      // When position changes, update both ID and name
      if (field === 'positionId' && typeof value === 'string') {
        const pos = positions.find(p => p.id === value);
        if (pos) {
          updates.position = pos.title;
        }
      }
      
      return { ...prev, ...updates };
    });
  };


  const processFile = (file: File | undefined | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or GIF).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropperOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFile(e.target.files?.[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    try {
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      const employeeId = employee?.id || `temp-${Date.now()}`;
      
      const avatarUrl = await uploadAvatar(file, employeeId);
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));

      // Persist immediately for existing employees so the photo isn't lost
      // if the user closes the dialog before saving the rest of the form.
      if (employee?.id) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          avatar_url: avatarUrl,
        });
      }
      
      toast({
        title: "Photo uploaded",
        description: employee?.id
          ? "Profile photo has been updated."
          : "Photo will be saved when you create the employee.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const initials = formData.firstName && formData.lastName 
    ? `${formData.firstName[0]}${formData.lastName[0]}`
    : 'NA';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="2xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Avatar Upload (with drag-and-drop) */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload profile photo by clicking or dragging an image"
              className={cn(
                "flex items-center gap-4 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/40",
                isUploading && "cursor-wait opacity-80"
              )}
            >
              <Avatar className="h-20 w-20 ring-2 ring-muted pointer-events-none">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                {selectedImage && (
                  <ImageCropper
                    open={cropperOpen}
                    onOpenChange={setCropperOpen}
                    imageSrc={selectedImage}
                    onCropComplete={handleCroppedImage}
                    aspectRatio={1}
                    cropShape="round"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  {isDragging
                    ? "Drop image to upload"
                    : "Drag & drop an image here, or click to browse. JPG, PNG or GIF. Max 5MB."}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondName">Second Name</Label>
                  <Input
                    id="secondName"
                    value={formData.secondName}
                    onChange={(e) => handleChange('secondName', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? format(parseISO(formData.dateOfBirth), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HierarchicalCalendar
                        selected={formData.dateOfBirth ? parseISO(formData.dateOfBirth) : undefined}
                        onSelect={(date) => handleChange('dateOfBirth', date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <CountrySelect
                    value={formData.nationality}
                    onValueChange={(v) => handleChange('nationality', v)}
                    placeholder="Select nationality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => handleChange('passportNumber', e.target.value)}
                    placeholder="Enter passport number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cprNumber">CPR Number</Label>
                  <Input
                    id="cprNumber"
                    value={formData.cprNumber}
                    onChange={(e) => handleChange('cprNumber', e.target.value)}
                    placeholder="Enter CPR number"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <PhoneInput
                    countryCode={formData.mobileCountryCode}
                    phoneNumber={formData.phone}
                    onCountryCodeChange={(code) => handleChange('mobileCountryCode', code)}
                    onPhoneNumberChange={(number) => handleChange('phone', number)}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Number</Label>
                  <PhoneInput
                    countryCode={formData.officeCountryCode}
                    phoneNumber={formData.officePhone}
                    onCountryCodeChange={(code) => handleChange('officeCountryCode', code)}
                    onPhoneNumberChange={(number) => handleChange('officePhone', number)}
                    placeholder="Enter office number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.departmentId || ''} onValueChange={(v) => handleChange('departmentId', v)}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select value={formData.positionId || ''} onValueChange={(v) => handleChange('positionId', v)}>
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="probation">Probation</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select 
                    value={formData.managerId || '__none__'} 
                    onValueChange={(v) => handleChange('managerId', v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger id="manager">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Manager</SelectItem>
                      {potentialManagers.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={emp.avatar} />
                              <AvatarFallback className="text-[10px]">
                                {emp.firstName[0]}{emp.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{emp.firstName} {emp.lastName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hiring Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.joinDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.joinDate ? format(parseISO(formData.joinDate), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HierarchicalCalendar
                        selected={formData.joinDate ? parseISO(formData.joinDate) : undefined}
                        onSelect={(date) => handleChange('joinDate', date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>


            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isEditing ? 'Save Changes' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}
