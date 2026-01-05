import { AuthLeftPanel, SignInForm } from "@/components/auth";

export default function Auth() {
  return (
    <div className="min-h-screen flex">
      <AuthLeftPanel />
      <SignInForm />
    </div>
  );
}
