import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import dgcLogoDark from "@/assets/dgc-logo-dark.svg";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Microsoft logo SVG component
function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}

export function SignInForm() {
  const navigate = useNavigate();
  const { signIn, signInWithAzure } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back",
      description: "You have successfully signed in.",
    });
    navigate("/");
  };

  const handleMicrosoftSignIn = async () => {
    setLoadingMicrosoft(true);
    const { error } = await signInWithAzure();
    
    if (error) {
      setLoadingMicrosoft(false);
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Microsoft. Please try again.",
        variant: "destructive",
      });
    }
    // Note: Don't set loadingMicrosoft to false on success - the page will redirect
  };

  return (
    <div 
      className="w-full lg:w-1/2 flex flex-col min-h-screen"
      style={{ backgroundColor: '#F7F8F6' }}
    >
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <img 
              src={dgcLogoDark} 
              alt="Dividend Gate Capital" 
              className="h-8 w-auto mb-2"
            />
            <span 
              className="text-xs font-medium tracking-[0.15em] uppercase"
              style={{ color: '#6B7280' }}
            >
              DGC Core
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-2xl sm:text-3xl font-semibold leading-tight mb-3"
              style={{ color: '#1A1A1A' }}
            >
              The core of how we work at DGC.
            </h1>
            <p style={{ color: '#6B7280' }}>
              Access your work life, benefits, and requests in one place.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium"
                style={{ color: '#1A1A1A' }}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@dgcholding.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 transition-all focus-visible:ring-0"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.email ? '#ef4444' : '#E6E8E3',
                  color: '#1A1A1A'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#C8A14A';
                  e.target.style.boxShadow = '0 0 0 3px rgba(200, 161, 74, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#E6E8E3';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium"
                style={{ color: '#1A1A1A' }}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10 transition-all focus-visible:ring-0"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.password ? '#ef4444' : '#E6E8E3',
                    color: '#1A1A1A'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#C8A14A';
                    e.target.style.boxShadow = '0 0 0 3px rgba(200, 161, 74, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#ef4444' : '#E6E8E3';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/auth/reset-password"
                className="text-sm transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C8A14A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium transition-all hover:opacity-90"
              style={{ 
                backgroundColor: '#C8A14A',
                color: '#1A1A1A'
              }}
              disabled={loading || loadingMicrosoft}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#E6E8E3' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span 
                className="px-2"
                style={{ backgroundColor: '#F7F8F6', color: '#6B7280' }}
              >
                or
              </span>
            </div>
          </div>

          {/* Microsoft Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-base font-medium transition-all"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#E6E8E3',
              color: '#1A1A1A'
            }}
            onClick={handleMicrosoftSignIn}
            disabled={loading || loadingMicrosoft}
          >
            <MicrosoftLogo className="mr-2 h-5 w-5" />
            {loadingMicrosoft ? "Redirecting..." : "Sign in with Microsoft"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="py-6 px-6 sm:px-8 lg:px-12 border-t text-center"
        style={{ borderColor: '#E6E8E3' }}
      >
        <p 
          className="text-xs"
          style={{ color: '#6B7280' }}
        >
          © Dividend Gate Capital — Internal system for DGC employees
        </p>
      </div>
    </div>
  );
}
