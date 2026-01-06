import { useState } from "react";
import { Plus, Pencil, Trash2, Building2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useWorkLocations,
  useCreateWorkLocation,
  useUpdateWorkLocation,
  useDeleteWorkLocation,
  WorkLocation,
  WorkLocationInput,
} from "@/hooks/useWorkLocations";
import { WorkLocationFormDialog } from "./WorkLocationFormDialog";

export function WorkLocationsSection() {
  const { data: workLocations, isLoading } = useWorkLocations();
  const createMutation = useCreateWorkLocation();
  const updateMutation = useUpdateWorkLocation();
  const deleteMutation = useDeleteWorkLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);

  const handleAdd = () => {
    setSelectedLocation(null);
    setDialogOpen(true);
  };

  const handleEdit = (location: WorkLocation) => {
    setSelectedLocation(location);
    setDialogOpen(true);
  };

  const handleDelete = (location: WorkLocation) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: WorkLocationInput) => {
    try {
      if (selectedLocation) {
        await updateMutation.mutateAsync({ id: selectedLocation.id, ...data });
        toast.success("Work location updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Work location created");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save work location");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;
    try {
      await deleteMutation.mutateAsync(selectedLocation.id);
      toast.success("Work location deleted");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete work location");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">Work Locations</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {workLocations && workLocations.length > 0 ? (
            <div className="space-y-2">
              {workLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    {location.is_remote ? (
                      <Wifi className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[location.city, location.country].filter(Boolean).join(", ") || "No address"}
                        {location.employeeCount > 0 && (
                          <span className="ml-2">• {location.employeeCount} employee{location.employeeCount !== 1 ? "s" : ""}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(location)}
                      disabled={location.employeeCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No work locations yet. Add your first one.
            </p>
          )}
        </CardContent>
      </Card>

      <WorkLocationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workLocation={selectedLocation}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
