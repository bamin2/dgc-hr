import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Receipt, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTripExpenses, useAddExpense, useReviewExpense } from '@/hooks/useBusinessTripExpenses';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory, ExpenseHRStatus } from '@/types/businessTrips';
import { cn } from '@/lib/utils';

interface TripExpensesSectionProps {
  tripId: string;
  canAddExpenses: boolean;
  isHROrAdmin: boolean;
}

const HR_STATUS_COLORS: Record<ExpenseHRStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  partially_approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};

const HR_STATUS_LABELS: Record<ExpenseHRStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  partially_approved: 'Partially Approved',
  rejected: 'Rejected',
};

export function TripExpensesSection({ tripId, canAddExpenses, isHROrAdmin }: TripExpensesSectionProps) {
  const { data: expenses, isLoading } = useTripExpenses(tripId);
  const addExpense = useAddExpense();
  const reviewExpense = useReviewExpense();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ status: 'approved' as ExpenseHRStatus, notes: '', approved_amount: 0 });
  const [newExpense, setNewExpense] = useState({
    category: 'other' as ExpenseCategory,
    amount_bhd: 0,
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const handleAddExpense = async () => {
    await addExpense.mutateAsync({
      trip_id: tripId,
      ...newExpense,
    });
    setAddDialogOpen(false);
    setNewExpense({
      category: 'other',
      amount_bhd: 0,
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    });
  };

  const handleOpenReview = (expenseId: string, currentAmount: number) => {
    setSelectedExpenseId(expenseId);
    setReviewData({ status: 'approved', notes: '', approved_amount: currentAmount });
    setReviewDialogOpen(true);
  };

  const handleReviewExpense = async () => {
    if (!selectedExpenseId) return;
    await reviewExpense.mutateAsync({
      expenseId: selectedExpenseId,
      status: reviewData.status,
      notes: reviewData.notes,
      approved_amount: reviewData.status === 'partially_approved' ? reviewData.approved_amount : undefined,
    });
    setReviewDialogOpen(false);
    setSelectedExpenseId(null);
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount_bhd, 0) || 0;
  const approvedTotal = expenses?.reduce((sum, e) => {
    if (e.hr_status === 'approved') return sum + e.amount_bhd;
    if (e.hr_status === 'partially_approved') return sum + (e.hr_approved_amount_bhd || 0);
    return sum;
  }, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <CardTitle className="text-lg">Expenses & Receipts</CardTitle>
          </div>
          {canAddExpenses && (
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !expenses?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses recorded yet.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (BHD)</TableHead>
                  <TableHead>Status</TableHead>
                  {isHROrAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{EXPENSE_CATEGORY_LABELS[expense.category]}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{expense.description || '-'}</TableCell>
                    <TableCell className="text-right">{expense.amount_bhd.toFixed(3)}</TableCell>
                    <TableCell>
                      <Badge className={cn(HR_STATUS_COLORS[expense.hr_status])}>
                        {HR_STATUS_LABELS[expense.hr_status]}
                      </Badge>
                    </TableCell>
                    {isHROrAdmin && (
                      <TableCell className="text-right">
                        {expense.hr_status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReview(expense.id, expense.amount_bhd)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <span className="text-muted-foreground">Total Claimed:</span>
              <span className="font-medium">BHD {totalExpenses.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Approved Total:</span>
              <span className="font-medium text-primary">BHD {approvedTotal.toFixed(3)}</span>
            </div>
          </>
        )}
      </CardContent>

      {/* Add Expense Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={newExpense.category}
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v as ExpenseCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (BHD) *</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={newExpense.amount_bhd}
                  onChange={(e) => setNewExpense({ ...newExpense, amount_bhd: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="Enter details about this expense..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense} disabled={!newExpense.amount_bhd || addExpense.isPending}>
              {addExpense.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Expense Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Decision *</Label>
              <Select
                value={reviewData.status}
                onValueChange={(v) => setReviewData({ ...reviewData, status: v as ExpenseHRStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="partially_approved">Partially Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reviewData.status === 'partially_approved' && (
              <div className="space-y-2">
                <Label>Approved Amount (BHD) *</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={reviewData.approved_amount}
                  onChange={(e) => setReviewData({ ...reviewData, approved_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={reviewData.notes}
                onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                placeholder="Add notes about your decision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReviewExpense} disabled={reviewExpense.isPending}>
              {reviewExpense.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
