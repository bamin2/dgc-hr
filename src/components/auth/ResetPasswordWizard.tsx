import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Snowflake, Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

type Step = "email" | "check-email" | "new-password" | "success";

const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[a-zA-Z]/, "Contains letters")
  .regex(/[0-9]/, "Contains numbers");

export function ResetPasswordWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, updatePassword } = useAuth();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Check if user came from magic link (has access_token or type param)
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "recovery") {
      setStep("new-password");
    }
  }, [searchParams]);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const emailSchema = z.string().email("Please enter a valid email address");
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setStep("check-email");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      toast({
        title: "Invalid password",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setStep("success");
  };

  const passwordChecks = {
    length: password.length >= 8,
    letters: /[a-zA-Z]/.test(password),
    numbers: /[0-9]/.test(password),
  };

  const steps = [
    { id: "email", label: "Enter email", number: 1 },
    { id: "check-email", label: "Check email", number: 2 },
    { id: "new-password", label: "Create password", number: 3 },
    { id: "success", label: "Success", number: 4 },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.id === step);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left sidebar with steps */}
      <div className="hidden lg:flex w-80 bg-sidebar-background p-8 flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-sidebar-primary/20 rounded-xl flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-sidebar-foreground" />
          </div>
          <span className="text-2xl font-semibold text-sidebar-foreground">Franfer</span>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((s, index) => {
            const currentIndex = getCurrentStepIndex();
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-primary/20"
                    : isCompleted
                    ? "opacity-60"
                    : "opacity-40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-sidebar-muted text-sidebar-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span className="text-sidebar-foreground text-sm">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Snowflake className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-semibold text-foreground">Franfer</span>
            </div>
          </div>

          {/* Step: Enter Email */}
          {step === "email" && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Reset Your Password</h2>
                <p className="text-muted-foreground mt-2">
                  Enter the email address associated with your account
                </p>
              </div>

              <form onSubmit={handleSendResetLink} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 h-12 ${emailError ? "border-destructive" : ""}`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </form>
            </>
          )}

          {/* Step: Check Email */}
          {step === "check-email" && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Check Your Email</h2>
                <p className="text-muted-foreground mt-2">
                  We've sent a password reset link to
                </p>
                <p className="font-medium text-foreground mt-1">{email}</p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => window.open("https://mail.google.com", "_blank")}
                >
                  Open Gmail
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the email?{" "}
                  <button
                    type="button"
                    onClick={handleSendResetLink as any}
                    className="text-primary hover:text-primary/80 transition-colors"
                    disabled={loading}
                  >
                    Resend
                  </button>
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </>
          )}

          {/* Step: Create New Password */}
          {step === "new-password" && (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Create New Password</h2>
                <p className="text-muted-foreground mt-2">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password requirements */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
                  <div className="space-y-1">
                    <PasswordCheck passed={passwordChecks.length} label="At least 8 characters" />
                    <PasswordCheck passed={passwordChecks.letters} label="Contains letters" />
                    <PasswordCheck passed={passwordChecks.numbers} label="Contains numbers" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Password Changed Successfully!</h2>
                <p className="text-muted-foreground mt-2">
                  You can now sign in with your new password
                </p>
              </div>

              <Button className="w-full h-12" onClick={() => navigate("/auth")}>
                Back to Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={passed ? "text-success" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
