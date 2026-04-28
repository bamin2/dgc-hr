import { NavLink, NavLinkProps } from "react-router-dom";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { preloadRoute } from "@/lib/routePreloader";
import { prefetchRouteData } from "@/lib/mobileNavPreloader";

interface PrefetchNavLinkProps extends NavLinkProps {
  prefetch?: boolean;
}

export function PrefetchNavLink({
  to,
  prefetch = true,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: PrefetchNavLinkProps) {
  const path = typeof to === "string" ? to : to.pathname || "";
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const triggerPrefetch = useCallback(() => {
    if (!prefetch) return;
    preloadRoute(path);
    prefetchRouteData(queryClient, path, user?.id);
  }, [path, prefetch, queryClient, user?.id]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onMouseEnter?.(e);
    },
    [triggerPrefetch, onMouseEnter]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onFocus?.(e);
    },
    [triggerPrefetch, onFocus]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onTouchStart?.(e);
    },
    [triggerPrefetch, onTouchStart]
  );

  return (
    <NavLink
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
      {...props}
    />
  );
}
