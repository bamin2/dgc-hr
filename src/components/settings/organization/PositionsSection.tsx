import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Briefcase, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  usePositionsManagement,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from '@/hooks/usePositionsManagement';
import { useDepartmentsManagement } from '@/hooks/useDepartmentsManagement';
import { PositionFormDialog } from './PositionFormDialog';

interface Position {
  id: string;
  title: string;
  department_id: string | null;
  department_name: string | null;
  level: number | null;
  employeeCount: number;
}

export function PositionsSection() {
  const { data: positions, isLoading } = usePositionsManagement();
  const { data: departments } = useDepartmentsManagement();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useDeletePosition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingPosition(null);
    setFormOpen(true);
  };

  const handleEdit = (pos: Position) => {
    setEditingPosition(pos);
    setFormOpen(true);
  };

  const handleSubmit = async (data: { title: string; department_id?: string | null; level?: number | null }) => {
    try {
      if (editingPosition) {
        await updateMutation.mutateAsync({ id: editingPosition.id, ...data });
        toast.success('Position updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Position created');
      }
      setFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save position');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Position deleted');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete position');
    }
  };

  const getLevelBadgeVariant = (level: number | null) => {
    if (!level) return 'secondary';
    if (level >= 8) return 'default';
    if (level >= 5) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Briefcase className="h-5 w-5 text-primary" />
            Positions
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {positions?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No positions yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Create your first position
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {positions?.map((pos) => (
                <div
                  key={pos.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{pos.title}</p>
                      <Badge variant={getLevelBadgeVariant(pos.level)} className="text-xs">
                        Level {pos.level || 1}
                      </Badge>
                    </div>
                    {pos.department_name && (
                      <p className="text-sm text-muted-foreground">
                        {pos.department_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {pos.employeeCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(pos)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(pos.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PositionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        position={editingPosition}
        departments={departments?.map(d => ({ id: d.id, name: d.name })) || []}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this position? This action cannot be undone.
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
    </>
  );
}
