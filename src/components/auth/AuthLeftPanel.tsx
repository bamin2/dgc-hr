import dgcLogoLight from "@/assets/dgc-people-logo.svg";

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[hsl(var(--auth-brand-panel))]">
      <div className="relative z-10 flex flex-col h-full w-full p-8 lg:p-12">
        {/* Logo */}
        <div className="mb-auto">
          <img
            src={dgcLogoLight}
            alt="Dividend Gate Capital"
            className="h-10 w-auto mb-4"
          />
          <span className="text-sm font-medium tracking-[0.15em] uppercase text-[hsl(var(--auth-brand-panel-foreground))]">
            DGC People
          </span>
        </div>

        {/* Value Statements */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-12 h-px mb-12 bg-[hsl(var(--auth-brand-panel-foreground)/0.2)]" />

          <div className="space-y-6">
            <ValueWord word="People" hasAccent />
            <ValueWord word="Purpose" />
            <ValueWord word="Progress" />
          </div>

          <div className="w-12 h-px mt-12 bg-[hsl(var(--auth-brand-panel-foreground)/0.2)]" />
        </div>

        {/* Spacer for balance */}
        <div className="mt-auto" />
      </div>
    </div>
  );
}

interface ValueWordProps {
  word: string;
  hasAccent?: boolean;
}

function ValueWord({ word, hasAccent }: ValueWordProps) {
  return (
    <div className="flex items-center gap-3">
      {hasAccent && <div className="w-1 h-6 rounded-full bg-success" />}
      <span
        className={`text-2xl lg:text-3xl font-light tracking-[0.1em] text-[hsl(var(--auth-brand-panel-foreground))] ${
          hasAccent ? "" : "ml-4"
        }`}
      >
        {word}
      </span>
    </div>
  );
}
