import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', balance: 15 },
  { value: 'sick', label: 'Sick Leave', balance: 8 },
  { value: 'personal', label: 'Personal Leave', balance: 4 },
  { value: 'maternity', label: 'Maternity Leave', balance: 90 },
  { value: 'paternity', label: 'Paternity Leave', balance: 14 },
  { value: 'unpaid', label: 'Unpaid Leave', balance: null },
];

export function LeaveRequestForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const selectedLeaveType = leaveTypes.find((t) => t.value === leaveType);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isHalfDay ? 0.5 : diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leaveType || !startDate || !endDate || !reason) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Leave Request Submitted',
      description: 'Your leave request has been submitted for approval.',
    });
    
    navigate('/attendance');
  };

  return (
    <Card className="border-0 shadow-sm max-w-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Request Leave</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      {type.balance !== null && (
                        <span className="text-xs text-muted-foreground ml-4">
                          ({type.balance} days available)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLeaveType?.balance !== null && selectedLeaveType?.balance !== undefined && (
              <p className="text-xs text-muted-foreground">
                Available balance: {selectedLeaveType.balance} days
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
          </div>

          {/* Half Day Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Half Day</Label>
              <p className="text-xs text-muted-foreground">Request only half a day off</p>
            </div>
            <Switch checked={isHalfDay} onCheckedChange={setIsHalfDay} />
          </div>

          {/* Total Days */}
          {startDate && endDate && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Total: <strong>{calculateDays()}</strong> {calculateDays() === 1 ? 'day' : 'days'}
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              placeholder="Please provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, or image files up to 10MB
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/attendance')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
