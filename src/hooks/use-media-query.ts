import * as React from "react";

/**
 * useMediaQuery - Hook to detect media query matches
 * 
 * @param query - Media query string (e.g., "(max-width: 640px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * useIsMobile - Convenience hook for mobile detection
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 640px)");
}

/**
 * useIsTablet - Convenience hook for tablet detection
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
}

/**
 * useIsDesktop - Convenience hook for desktop detection
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)");
}
