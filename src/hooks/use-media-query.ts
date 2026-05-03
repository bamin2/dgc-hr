import * as React from "react";

/**
 * useMediaQuery - Hook to detect media query matches
 *
 * @param query - Media query string (e.g., "(max-width: 767px)")
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

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Canonical breakpoints — aligned with Tailwind defaults (sm=640, md=768, lg=1024).
 *
 * - mobile:  < 768px           → bottom nav, sheets, card lists
 * - tablet:  768–1023px        → sidebar, dialogs allowed
 * - desktop: ≥ 1024px          → full sidebar + all features
 *
 * Use `useIsBelowDesktop` for feature gates that should block both mobile and tablet
 * (e.g. payroll, reports, audit).
 */
export const useIsMobile = (): boolean => useMediaQuery("(max-width: 767px)");
export const useIsTablet = (): boolean =>
  useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = (): boolean => useMediaQuery("(min-width: 1024px)");
export const useIsBelowDesktop = (): boolean => useMediaQuery("(max-width: 1023px)");
