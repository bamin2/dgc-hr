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
          description: `${employee.firstName} ${employee.lastName} has been removed.`,
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
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          department_id: data.departmentId || null,
          position_id: data.positionId || null,
          status: data.status as any,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender as any || null,
          address: data.address || null,
          nationality: data.nationality || null,
          avatar_url: data.avatar || null,
        });
        toast({
          title: "Employee updated",
          description: `${data.firstName} ${data.lastName}'s information has been updated.`,
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
          manager_id: newManagerId,
        });

        toast({
          title: "Manager reassigned",
          description: `${employee.firstName} ${employee.lastName} now reports to ${newManager.firstName} ${newManager.lastName}.`,
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
              manager_id: managerId,
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
