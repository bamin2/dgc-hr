import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Employee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/hooks/useEmployees";
import { toast } from "@/hooks/use-toast";

interface UseEmployeeActionsReturn {
  handleView: (employee: Employee) => void;
  handleDelete: (employee: Employee) => Promise<void>;
  handleSave: (employee: Employee, data: Partial<Employee>) => Promise<void>;
  handleReassign: (employeeId: string, newManagerId: string, employees: Employee[]) => Promise<void>;
  handleBulkReassign: (assignments: { employeeId: string; managerId: string }[]) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useEmployeeActions(
  onDeleteSuccess?: (employeeId: string) => void
): UseEmployeeActionsReturn {
  const navigate = useNavigate();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const handleView = useCallback(
    (employee: Employee) => {
      navigate(`/employees/${employee.id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (employee: Employee) => {
      try {
        await deleteEmployee.mutateAsync(employee.id);
        onDeleteSuccess?.(employee.id);
        toast({
          title: "Employee deleted",
          description: `${employee.first_name} ${employee.last_name} has been removed.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete employee. Please try again.",
          variant: "destructive",
        });
      }
    },
    [deleteEmployee, onDeleteSuccess]
  );

  const handleSave = useCallback(
    async (employee: Employee, data: Partial<Employee>) => {
      try {
        await updateEmployee.mutateAsync({
          id: employee.id,
          updates: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            department_id: data.department_id || null,
            position_id: data.position_id || null,
            status: data.status,
            date_of_birth: data.date_of_birth || null,
            gender: data.gender || null,
            address: data.address || null,
            nationality: data.nationality || null,
            avatar_url: data.avatar_url || null,
            join_date: data.join_date || null,
          },
        });
        toast({
          title: "Employee updated",
          description: `${data.first_name} ${data.last_name}'s information has been updated.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update employee. Please try again.",
          variant: "destructive",
        });
      }
    },
    [updateEmployee]
  );

  const handleReassign = useCallback(
    async (employeeId: string, newManagerId: string, employees: Employee[]) => {
      const employee = employees.find((e) => e.id === employeeId);
      const newManager = employees.find((e) => e.id === newManagerId);

      if (!employee || !newManager) return;

      try {
        await updateEmployee.mutateAsync({
          id: employeeId,
          updates: { manager_id: newManagerId },
        });

        toast({
          title: "Manager reassigned",
          description: `${employee.first_name} ${employee.last_name} now reports to ${newManager.first_name} ${newManager.last_name}.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to reassign manager. Please try again.",
          variant: "destructive",
        });
      }
    },
    [updateEmployee]
  );

  const handleBulkReassign = useCallback(
    async (assignments: { employeeId: string; managerId: string }[]) => {
      try {
        await Promise.all(
          assignments.map(({ employeeId, managerId }) =>
            updateEmployee.mutateAsync({
              id: employeeId,
              updates: { manager_id: managerId },
            })
          )
        );
        toast({
          title: "Managers assigned",
          description: `Updated ${assignments.length} employee(s).`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to assign managers. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    },
    [updateEmployee]
  );

  return {
    handleView,
    handleDelete,
    handleSave,
    handleReassign,
    handleBulkReassign,
    isUpdating: updateEmployee.isPending,
    isDeleting: deleteEmployee.isPending,
  };
}
