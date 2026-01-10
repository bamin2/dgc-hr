/**
 * FX Rates Management Section
 * Admin UI for managing currency exchange rates
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import {
  useFxRates,
  useCreateFxRate,
  useUpdateFxRate,
  useDeleteFxRate,
  type FxRate,
  type CreateFxRateInput,
} from '@/hooks/useFxRates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Common currencies used in the region
const SUPPORTED_CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
];

interface FxRateFormData {
  quote_currency_code: string;
  rate: string;
  effective_date: string;
}

const initialFormData: FxRateFormData = {
  quote_currency_code: '',
  rate: '',
  effective_date: new Date().toISOString().split('T')[0],
};

export function FxRatesSection() {
  const { data: rates = [], isLoading, refetch } = useFxRates();
  const createRate = useCreateFxRate();
  const updateRate = useUpdateFxRate();
  const deleteRate = useDeleteFxRate();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<FxRate | null>(null);
  const [deletingRate, setDeletingRate] = useState<FxRate | null>(null);
  const [formData, setFormData] = useState<FxRateFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: CreateFxRateInput = {
      quote_currency_code: formData.quote_currency_code,
      rate: parseFloat(formData.rate),
      effective_date: formData.effective_date,
    };

    if (editingRate) {
      await updateRate.mutateAsync({
        id: editingRate.id,
        rate: input.rate,
        effective_date: input.effective_date,
      });
      setEditingRate(null);
    } else {
      await createRate.mutateAsync(input);
    }

    setFormData(initialFormData);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (rate: FxRate) => {
    setEditingRate(rate);
    setFormData({
      quote_currency_code: rate.quote_currency_code,
      rate: rate.rate.toString(),
      effective_date: rate.effective_date,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingRate) {
      await deleteRate.mutateAsync(deletingRate.id);
      setDeletingRate(null);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingRate(null);
    setFormData(initialFormData);
  };

  // Group rates by currency for display
  const latestRatesByCurrency = new Map<string, FxRate>();
  rates.forEach(rate => {
    const existing = latestRatesByCurrency.get(rate.quote_currency_code);
    if (!existing || rate.effective_date > existing.effective_date) {
      latestRatesByCurrency.set(rate.quote_currency_code, rate);
    }
  });

  // Find currencies without rates
  const currenciesWithRates = new Set(rates.map(r => r.quote_currency_code));
  const missingCurrencies = SUPPORTED_CURRENCIES.filter(
    c => !currenciesWithRates.has(c.code)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Exchange Rates</CardTitle>
            <CardDescription>
              Manage currency exchange rates for multi-currency salary reporting. 
              Base currency is BHD (Bahraini Dinar).
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => {
                  setEditingRate(null);
                  setFormData(initialFormData);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRate ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the exchange rate showing how many units of the selected currency
                      equals 1 BHD.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.quote_currency_code}
                        onValueChange={(value) => setFormData({ ...formData, quote_currency_code: value })}
                        disabled={!!editingRate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rate">
                        Rate (1 BHD = ? {formData.quote_currency_code || 'units'})
                      </Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.000001"
                        min="0.000001"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        placeholder="e.g., 9.94 for SAR"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter how many {formData.quote_currency_code || 'units'} equals 1 BHD
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="effective_date">Effective Date</Label>
                      <Input
                        id="effective_date"
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createRate.isPending || updateRate.isPending}
                    >
                      {editingRate ? 'Update' : 'Add'} Rate
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missingCurrencies.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-500">Missing Exchange Rates</p>
              <p className="text-xs text-muted-foreground mt-1">
                The following currencies don't have exchange rates configured:{' '}
                {missingCurrencies.map(c => c.code).join(', ')}. 
                Reports using these currencies cannot be converted to BHD.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exchange rates configured.</p>
            <p className="text-sm mt-1">Add rates to enable multi-currency reporting.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Rate (1 BHD =)</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.quote_currency_code}
                      {latestRatesByCurrency.get(rate.quote_currency_code)?.id === rate.id && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(rate.rate).toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(rate.effective_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(rate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingRate(rate)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingRate} onOpenChange={() => setDeletingRate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exchange Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the {deletingRate?.quote_currency_code} rate 
              effective {deletingRate && format(new Date(deletingRate.effective_date), 'MMM d, yyyy')}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
