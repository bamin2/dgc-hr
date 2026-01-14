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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  useBusinessTripDestinations,
  useCreateDestination,
  useUpdateDestination,
  useDeleteDestination,
} from '@/hooks/useBusinessTripDestinations';
import { BusinessTripDestination } from '@/types/businessTrips';

export function DestinationsManager() {
  const { data: destinations, isLoading } = useBusinessTripDestinations();
  const createDestination = useCreateDestination();
  const updateDestination = useUpdateDestination();
  const deactivateDestination = useDeleteDestination();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<BusinessTripDestination | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    per_diem_rate_bhd: 0,
  });

  const handleOpenCreate = () => {
    setEditingDestination(null);
    setFormData({ name: '', country: '', city: '', per_diem_rate_bhd: 0 });
    setDialogOpen(true);
  };

  const handleOpenEdit = (dest: BusinessTripDestination) => {
    setEditingDestination(dest);
    setFormData({
      name: dest.name,
      country: dest.country || '',
      city: dest.city || '',
      per_diem_rate_bhd: dest.per_diem_rate_bhd,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingDestination) {
      await updateDestination.mutateAsync({
        id: editingDestination.id,
        ...formData,
      });
    } else {
      await createDestination.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  const handleDeactivate = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this destination?')) {
      await deactivateDestination.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Per Diem Destinations</CardTitle>
            <CardDescription>Manage destinations and their per diem rates (BHD)</CardDescription>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !destinations?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No destinations configured. Add your first destination to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Per Diem Rate (BHD)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {destinations.map((dest) => (
                <TableRow key={dest.id}>
                  <TableCell className="font-medium">{dest.name}</TableCell>
                  <TableCell>{dest.country || '-'}</TableCell>
                  <TableCell>{dest.city || '-'}</TableCell>
                  <TableCell className="text-right">{dest.per_diem_rate_bhd.toFixed(3)}</TableCell>
                  <TableCell>
                    <Badge variant={dest.is_active ? 'default' : 'secondary'}>
                      {dest.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(dest)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {dest.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(dest.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDestination ? 'Edit Destination' : 'Add Destination'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Destination Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dubai, UAE"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., UAE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Dubai"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Per Diem Rate (BHD) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.001"
                value={formData.per_diem_rate_bhd}
                onChange={(e) =>
                  setFormData({ ...formData, per_diem_rate_bhd: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || createDestination.isPending || updateDestination.isPending}
            >
              {(createDestination.isPending || updateDestination.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingDestination ? 'Save Changes' : 'Add Destination'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
