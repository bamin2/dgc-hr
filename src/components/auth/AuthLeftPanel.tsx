import { Clock, BarChart3, Users, Snowflake } from "lucide-react";

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col h-full w-full p-8 lg:p-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-auto">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-primary-foreground">Franfer</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6 leading-tight">
            Simplify HR Operations, Empower Your Team
          </h1>
          
          {/* Feature cards */}
          <div className="space-y-4">
            <FeatureCard
              icon={<Clock className="w-5 h-5" />}
              title="Time Tracking"
              description="Track every hour with precision"
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Analytics"
              description="Make data-driven decisions"
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Team Management"
              description="Connect your entire team"
            />
          </div>
        </div>

        {/* Time tracker preview card */}
        <div className="mt-auto">
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-foreground/80">Today's Progress</span>
              <span className="text-xs text-primary-foreground/60">8h 24m</span>
            </div>
            <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-primary-foreground rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl border border-primary-foreground/20">
      <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center flex-shrink-0 text-primary-foreground">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-primary-foreground">{title}</h3>
        <p className="text-sm text-primary-foreground/70">{description}</p>
      </div>
    </div>
  );
}
