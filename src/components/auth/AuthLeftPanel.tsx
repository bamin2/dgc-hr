import dgcLogoLight from "@/assets/dgc-logo-light.svg";

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2E2B 0%, #1C1F23 100%)' }}>
      <div className="relative z-10 flex flex-col h-full w-full p-8 lg:p-12">
        {/* Logo */}
        <div className="mb-auto">
          <img 
            src={dgcLogoLight} 
            alt="Dividend Gate Capital" 
            className="h-10 w-auto mb-4"
          />
          <span 
            className="text-sm font-medium tracking-[0.15em] uppercase"
            style={{ color: '#e7e2da' }}
          >
            DGC Core
          </span>
        </div>

        {/* Value Statements */}
        <div className="flex-1 flex flex-col justify-center">
          <div 
            className="w-12 h-px mb-12"
            style={{ backgroundColor: 'rgba(231, 226, 218, 0.2)' }}
          />
          
          <div className="space-y-6">
            <ValueWord word="People" hasAccent />
            <ValueWord word="Purpose" />
            <ValueWord word="Progress" />
          </div>

          <div 
            className="w-12 h-px mt-12"
            style={{ backgroundColor: 'rgba(231, 226, 218, 0.2)' }}
          />
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
      {hasAccent && (
        <div 
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: '#C8A14A' }}
        />
      )}
      <span 
        className="text-2xl lg:text-3xl font-light tracking-[0.1em]"
        style={{ 
          color: '#e7e2da',
          marginLeft: hasAccent ? 0 : '1rem'
        }}
      >
        {word}
      </span>
    </div>
  );
}
