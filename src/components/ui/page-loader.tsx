import dgcLogoMark from "@/assets/dgc-logo-mark.svg";

export function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-screen w-full flex items-center justify-center bg-background"
    >
      <img
        src={dgcLogoMark}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 animate-sla-pulse"
      />
    </div>
  );
}
