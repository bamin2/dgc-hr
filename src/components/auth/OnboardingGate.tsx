import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, LogOut } from "lucide-react";

export function OnboardingGate() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center space-y-6 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Welcome to DGC People
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We're getting your account set up. Your HR team has been notified —
            you'll have full access shortly.
          </p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground flex items-start gap-3 text-left">
          <Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            If this takes more than one business day, please email{" "}
            <a
              href="mailto:hr@dgcholding.com"
              className="text-primary font-medium hover:underline"
            >
              hr@dgcholding.com
            </a>
            .
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
