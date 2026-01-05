import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: {
    id: string;
    name: string;
    description: string | null;
    manager_id: string | null;
  } | null;
  employees: Employee[];
  onSubmit: (data: { name: string; description?: string | null; manager_id?: string | null }) => Promise<void>;
  isLoading: boolean;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  employees,
  onSubmit,
  isLoading,
}: DepartmentFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState<string>('');

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || '');
      setManagerId(department.manager_id || '');
    } else {
      setName('');
      setDescription('');
      setManagerId('');
    }
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      manager_id: managerId || null,
    });
  };

  const isEdit = !!department;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Engineering"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the department"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Department Head</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department head (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No department head</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={emp.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.first_name} {emp.last_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
