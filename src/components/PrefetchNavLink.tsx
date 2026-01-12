import { NavLink, NavLinkProps } from "react-router-dom";
import { preloadRoute } from "@/lib/routePreloader";
import { useCallback } from "react";

interface PrefetchNavLinkProps extends NavLinkProps {
  prefetch?: boolean;
}

export function PrefetchNavLink({
  to,
  prefetch = true,
  onMouseEnter,
  onFocus,
  ...props
}: PrefetchNavLinkProps) {
  const path = typeof to === "string" ? to : to.pathname || "";

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch) preloadRoute(path);
      onMouseEnter?.(e);
    },
    [path, prefetch, onMouseEnter]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      if (prefetch) preloadRoute(path);
      onFocus?.(e);
    },
    [path, prefetch, onFocus]
  );

  return (
    <NavLink
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    />
  );
}
