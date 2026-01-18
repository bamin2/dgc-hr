import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployees } from "@/hooks/useEmployees";
import { ImpersonatedEmployee } from "@/contexts/RoleContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ImpersonationEmployeeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEmployee: (employee: ImpersonatedEmployee) => void;
}

export function ImpersonationEmployeeSelector({
  open,
  onOpenChange,
  onSelectEmployee,
}: ImpersonationEmployeeSelectorProps) {
  const [search, setSearch] = useState("");
  const { data: employees, isLoading } = useEmployees();

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    
    const searchLower = search.toLowerCase();
    return employees
      .filter(emp => emp.status === "active")
      .filter(emp => 
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower) ||
        emp.position.toLowerCase().includes(searchLower)
      );
  }, [employees, search]);

  const handleSelect = (emp: typeof filteredEmployees[0]) => {
    onSelectEmployee({
      id: emp.id,
      name: emp.fullName,
      avatar: emp.avatar,
      department: emp.department,
      position: emp.position,
    });
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>View as Employee</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {search ? "No employees found matching your search" : "No employees available"}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEmployees.map((emp) => {
                  const initials = emp.fullName
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleSelect(emp)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={emp.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.position} • {emp.department}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
