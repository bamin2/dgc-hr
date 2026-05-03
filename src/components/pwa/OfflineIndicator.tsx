import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      toast.success("You're back online!", {
        icon: <Wifi className="h-4 w-4" />,
        duration: 3000,
      });
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      toast.error("You're offline", {
        description: "Some features may be unavailable",
        icon: <WifiOff className="h-4 w-4" />,
        duration: Infinity,
        id: "offline-toast",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show initial offline toast if starting offline
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      // Dismiss the offline toast when unmounting
      toast.dismiss("offline-toast");
    };
  }, []);

  // This component doesn't render anything visible - it just manages toasts
  return null;
}
