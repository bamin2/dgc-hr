import { format } from "date-fns";
import { BentoCard } from "./BentoCard";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Mobile greeting header with time-based greeting and current date
 * Lightweight, minimal text, no icons
 */
export function MobileGreetingCard() {
  const { profile } = useAuth();
  const firstName = profile?.first_name || "there";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <BentoCard colSpan={12} className="p-4 pb-3">
      <h1 className="text-xl font-semibold text-foreground">
        {getGreeting()}, {firstName}!
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        {format(new Date(), "EEEE, MMMM d")}
      </p>
    </BentoCard>
  );
}
