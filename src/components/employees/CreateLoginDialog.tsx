import { useState } from "react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  onSuccess?: () => void;
}

export function CreateLoginDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: CreateLoginDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isValid = hasMinLength && hasLettersAndNumbers && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setLoading(true);

    try {
    // Get the current session to include the access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast.error("You must be logged in to create employee logins");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("create-employee-login", {
      body: {
        employeeId: employee.id,
        email: employee.email,
        password,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

      if (error) {
        console.error("Error creating login:", error);
        toast.error(error.message || "Failed to create login");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Login created for ${employee.firstName} ${employee.lastName}`);
      setPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Employee Login</DialogTitle>
          <DialogDescription>
            Create login credentials for {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Input
              value={`${employee.firstName} ${employee.lastName}`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={employee.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter temporary password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">Password requirements:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                {hasMinLength ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={hasMinLength ? "text-green-500" : "text-muted-foreground"}>
                  At least 8 characters
                </span>
              </li>
              <li className="flex items-center gap-2">
                {hasLettersAndNumbers ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={hasLettersAndNumbers ? "text-green-500" : "text-muted-foreground"}>
                  Contains letters and numbers
                </span>
              </li>
              <li className="flex items-center gap-2">
                {passwordsMatch ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={passwordsMatch ? "text-green-500" : "text-muted-foreground"}>
                  Passwords match
                </span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Login"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
