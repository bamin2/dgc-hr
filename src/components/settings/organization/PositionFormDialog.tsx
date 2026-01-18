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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: {
    id: string;
    title: string;
    department_id: string | null;
    level: number | null;
    job_description: string | null;
  } | null;
  departments: Department[];
  onSubmit: (data: { title: string; department_id?: string | null; level?: number | null; job_description?: string | null }) => Promise<void>;
  isLoading: boolean;
}

export function PositionFormDialog({
  open,
  onOpenChange,
  position,
  departments,
  onSubmit,
  isLoading,
}: PositionFormDialogProps) {
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('none');
  const [level, setLevel] = useState<number>(1);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (position) {
      setTitle(position.title);
      setDepartmentId(position.department_id || 'none');
      setLevel(position.level ?? 1);
      setJobDescription(position.job_description || '');
    } else {
      setTitle('');
      setDepartmentId('none');
      setLevel(1);
      setJobDescription('');
    }
  }, [position, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onSubmit({
      title: title.trim(),
      department_id: departmentId === 'none' ? null : departmentId,
      level,
      job_description: jobDescription.trim() || null,
    });
  };

  const isEdit = !!position;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Position' : 'Add Position'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Developer"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level (1-10)</Label>
            <Input
              id="level"
              type="number"
              min={1}
              max={10}
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Higher levels indicate more senior positions
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the responsibilities, requirements, and qualifications..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Position'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
