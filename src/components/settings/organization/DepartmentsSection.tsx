import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Building2, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  useDepartmentsManagement,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/useDepartmentsManagement';
import { useEmployees } from '@/hooks/useEmployees';
import { DepartmentFormDialog } from './DepartmentFormDialog';

interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  manager_name: string | null;
  manager_avatar: string | null;
  employeeCount: number;
}

export function DepartmentsSection() {
  const { data: departments, isLoading } = useDepartmentsManagement();
  const { data: employees } = useEmployees();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormOpen(true);
  };

  const handleSubmit = async (data: { name: string; description?: string | null; manager_id?: string | null }) => {
    try {
      if (editingDepartment) {
        await updateMutation.mutateAsync({ id: editingDepartment.id, ...data });
        toast.success('Department updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Department created');
      }
      setFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save department');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Department deleted');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  // Map employees to the format needed by the form
  const employeeOptions = (employees || []).map(emp => ({
    id: emp.id,
    first_name: emp.firstName,
    last_name: emp.lastName,
    avatar_url: emp.avatar || null,
  }));

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
            <Building2 className="h-5 w-5 text-primary" />
            Departments
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {departments?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No departments yet</p>
              <Button variant="link" onClick={handleAdd} className="mt-2">
                Create your first department
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {departments?.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dept.name}</p>
                    {dept.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {dept.description}
                      </p>
                    )}
                    {dept.manager_name && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={dept.manager_avatar || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {dept.manager_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          Head: {dept.manager_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {dept.employeeCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(dept)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(dept.id)}
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

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editingDepartment}
        employees={employeeOptions}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
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
