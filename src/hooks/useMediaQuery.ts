import { useState, useEffect } from 'react';

/**
 * Hook to detect media query changes for responsive design
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Initialize with current match state
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Set initial state
    setMatches(mediaQuery.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (use modern API with fallback)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(listener);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Pre-configured breakpoint hooks for common use cases
 */
export const useBreakpoint = {
  isMobile: () => useMediaQuery('(max-width: 768px)'),
  isTablet: () => useMediaQuery('(min-width: 768px) and (max-width: 1024px)'),
  isDesktop: () => useMediaQuery('(min-width: 1024px)'),
  isLargeDesktop: () => useMediaQuery('(min-width: 1440px)'),
};
