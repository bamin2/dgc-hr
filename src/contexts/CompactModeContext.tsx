import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface CompactModeContextType {
  isCompact: boolean;
}

const CompactModeContext = createContext<CompactModeContextType>({ isCompact: false });

export function useCompactMode() {
  return useContext(CompactModeContext);
}

interface CompactModeProviderProps {
  children: ReactNode;
}

export function CompactModeProvider({ children }: CompactModeProviderProps) {
  const { preferences, isLoading } = useUserPreferences();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    // Only update when we have loaded preferences
    if (!isLoading && preferences?.display?.compactMode !== undefined) {
      setIsCompact(preferences.display.compactMode);
    }
  }, [preferences?.display?.compactMode, isLoading]);

  useEffect(() => {
    if (isCompact) {
      document.body.classList.add("compact");
    } else {
      document.body.classList.remove("compact");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("compact");
    };
  }, [isCompact]);

  return (
    <CompactModeContext.Provider value={{ isCompact }}>
      {children}
    </CompactModeContext.Provider>
  );
}
