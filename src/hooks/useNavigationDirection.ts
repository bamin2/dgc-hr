import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export type NavDirection = "forward" | "back" | "replace";

/**
 * Tracks the direction of the latest route change.
 * - PUSH  -> "forward"
 * - POP   -> "back"
 * - REPLACE -> "replace"
 *
 * Uses React Router's navigation type as the primary signal and falls back to
 * comparing `history.state.idx` to disambiguate same-key replacements.
 */
export function useNavigationDirection(): NavDirection {
  const location = useLocation();
  const navType = useNavigationType(); // "PUSH" | "POP" | "REPLACE"
  const prevIdxRef = useRef<number | null>(null);
  const [direction, setDirection] = useState<NavDirection>("forward");

  useEffect(() => {
    const idx =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number"
        ? (window.history.state.idx as number)
        : null;

    let next: NavDirection = "forward";
    if (navType === "POP") {
      if (idx != null && prevIdxRef.current != null && idx > prevIdxRef.current) {
        next = "forward";
      } else {
        next = "back";
      }
    } else if (navType === "REPLACE") {
      next = "replace";
    } else {
      next = "forward";
    }

    setDirection(next);
    prevIdxRef.current = idx;
  }, [location, navType]);

  return direction;
}
