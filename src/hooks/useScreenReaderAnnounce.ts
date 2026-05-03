import { useEffect } from "react";

export const SR_ANNOUNCE_REGION_ID = "sr-announce-region";

/**
 * Writes `message` into the global screen reader live region
 * rendered in App.tsx. Clears it 2s later so repeats re-announce.
 * Pass falsy to skip.
 */
export function useScreenReaderAnnounce(message: string | null | undefined): void {
  useEffect(() => {
    if (!message) return;

    const region = document.getElementById(SR_ANNOUNCE_REGION_ID);
    if (!region) return;

    region.textContent = message;

    const timeout = window.setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = "";
      }
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [message]);
}
