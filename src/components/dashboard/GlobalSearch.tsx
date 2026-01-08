import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEmployees } from "@/hooks/useEmployees";
import { useRole } from "@/contexts/RoleContext";
import {
  Users,
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Palmtree,
  Heart,
  CheckSquare,
  Bell,
  DollarSign,
  FileText,
  BarChart3,
  Building2,
  UserCog,
  Palette,
  Shield,
  Workflow,
  Plug,
  Network,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Directory", path: "/directory", icon: Users },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Time Off", path: "/time-off", icon: Palmtree },
  { name: "Benefits", path: "/benefits", icon: Heart },
  { name: "Approvals", path: "/approvals", icon: CheckSquare },
  { name: "Notifications", path: "/notifications", icon: Bell },
];

const adminPages = [
  { name: "Employees", path: "/employees", icon: Users },
  { name: "Payroll", path: "/payroll", icon: DollarSign },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Documents", path: "/documents", icon: FileText },
];

const settingsTabs = [
  { name: "Company Profile", tab: "company", icon: Building2, adminOnly: true },
  { name: "Organization", tab: "organization", icon: Network, adminOnly: true },
  { name: "Dashboard Settings", tab: "dashboard", icon: Palette, adminOnly: true },
  { name: "Approval Workflows", tab: "approvals", icon: Workflow, adminOnly: true },
  { name: "Payroll Settings", tab: "payroll", icon: DollarSign, adminOnly: true },
  { name: "Preferences", tab: "preferences", icon: UserCog, adminOnly: false },
  { name: "Notifications", tab: "notifications", icon: Bell, adminOnly: false },
  { name: "Integrations", tab: "integrations", icon: Plug, adminOnly: false },
  { name: "Security", tab: "security", icon: Shield, adminOnly: false },
];

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { data: employees = [] } = useEmployees();
  const { canManageRoles } = useRole();
  const [search, setSearch] = useState("");

  const canAccessAdminPages = canManageRoles;

  const getEmployeeFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
  };

  const filteredEmployees = employees
    .filter((emp) => emp.status === "active")
    .filter((emp) => {
      const searchLower = search.toLowerCase();
      const fullName = getEmployeeFullName(emp.firstName, emp.lastName);
      return (
        fullName.toLowerCase().includes(searchLower) ||
        emp.department?.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower)
      );
    })
    .slice(0, 5);

  const filteredPages = [...pages, ...(canAccessAdminPages ? adminPages : [])].filter(
    (page) => page.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSettings = settingsTabs
    .filter((setting) => !setting.adminOnly || canAccessAdminPages)
    .filter((setting) => setting.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    setSearch("");
    callback();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search employees, pages, settings..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredEmployees.length > 0 && (
          <CommandGroup heading="Employees">
            {filteredEmployees.map((employee) => {
              const fullName = getEmployeeFullName(employee.firstName, employee.lastName);
              return (
                <CommandItem
                  key={employee.id}
                  value={`employee-${fullName}`}
                  onSelect={() => handleSelect(() => navigate(`/employees/${employee.id}`))}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={employee.avatar} alt={fullName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {employee.position} • {employee.department}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {filteredPages.length > 0 && (
          <>
            {filteredEmployees.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Pages">
              {filteredPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={`page-${page.name}`}
                  onSelect={() => handleSelect(() => navigate(page.path))}
                  className="flex items-center gap-3"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredSettings.length > 0 && (
          <>
            {(filteredEmployees.length > 0 || filteredPages.length > 0) && <CommandSeparator />}
            <CommandGroup heading="Settings">
              {filteredSettings.map((setting) => (
                <CommandItem
                  key={setting.tab}
                  value={`setting-${setting.name}`}
                  onSelect={() =>
                    handleSelect(() => navigate(`/settings?tab=${setting.tab}`))
                  }
                  className="flex items-center gap-3"
                >
                  <setting.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{setting.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
