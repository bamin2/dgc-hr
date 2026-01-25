import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus, FileText, Copy, Archive, Star, MoreHorizontal, Eye, Pencil, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePayslipTemplates,
  useDuplicatePayslipTemplate,
  useArchivePayslipTemplate,
  useSetDefaultPayslipTemplate,
} from "@/hooks/usePayslipTemplates";
import { PayslipEmailTemplateTab } from "@/components/payroll/templates/PayslipEmailTemplateTab";
import type { PayslipTemplate, PayslipTemplateStatus } from "@/types/payslip-template";

const statusColors: Record<PayslipTemplateStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-500/10 text-emerald-600",
  archived: "bg-destructive/10 text-destructive",
};

export default function PayslipTemplates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const currentTab = searchParams.get("tab") || "templates";
  
  const { data: templates, isLoading } = usePayslipTemplates();
  const duplicateMutation = useDuplicatePayslipTemplate();
  const archiveMutation = useArchivePayslipTemplate();
  const setDefaultMutation = useSetDefaultPayslipTemplate();

  const filteredTemplates = templates?.filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter
  );

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id, {
      onSuccess: (data) => {
        navigate(`/payroll/templates/${data.id}`);
      },
    });
  };

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleSetDefault = (template: PayslipTemplate) => {
    setDefaultMutation.mutate({
      id: template.id,
      workLocationId: template.work_location_id,
    });
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payslip Templates"
          subtitle="Manage DOCX templates and email notifications for payslips"
        />

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4" />
              DOCX Templates
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4" />
              Email Notification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6 space-y-6">
            {/* New Template Button */}
            <div className="flex justify-end">
              <Button onClick={() => navigate("/payroll/templates/new")}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

            {/* Templates Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredTemplates?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No templates found</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Create your first payslip template to get started
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate("/payroll/templates/new")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Location</TableHead>
                        <TableHead className="hidden sm:table-cell">Version</TableHead>
                        <TableHead className="hidden lg:table-cell">Effective From</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates?.map((template) => (
                        <TableRow 
                          key={template.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/payroll/templates/${template.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {template.name}
                                  {template.is_default && (
                                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {template.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={statusColors[template.status]}>
                              {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {template.work_location?.name || (
                              <span className="text-muted-foreground">Global</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            v{template.version_number}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {template.effective_from
                              ? format(new Date(template.effective_from), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {format(new Date(template.updated_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/payroll/templates/${template.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/payroll/templates/${template.id}`)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                {template.status === "active" && !template.is_default && (
                                  <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Default
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {template.status !== "archived" && (
                                  <DropdownMenuItem
                                    onClick={() => handleArchive(template.id)}
                                    className="text-destructive"
                                  >
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <PayslipEmailTemplateTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
