import { Check, Clock, Calendar, Briefcase, Flag, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTimeOffBalance } from "@/data/timeoff";

interface SummaryItemProps {
  icon: React.ReactNode;
  bgColor: string;
  days: number;
  label: string;
  sublabel: string;
  link?: string;
}

function SummaryItem({ icon, bgColor, days, label, sublabel, link }: SummaryItemProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${bgColor}`}>
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex-1 text-white">
        <p className="font-semibold">
          <span className="text-xl">{days}</span> days {label}
        </p>
        {link ? (
          <a href="#" className="text-sm opacity-80 hover:underline">{sublabel}</a>
        ) : (
          <p className="text-sm opacity-80">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

export function TimeOffSummaryCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">About your time off</CardTitle>
        <Button variant="outline" size="sm">See details</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <SummaryItem
          icon={<Check className="w-5 h-5" />}
          bgColor="bg-primary"
          days={mockTimeOffBalance.availableDays}
          label="paid time off"
          sublabel="Available to book"
        />
        <SummaryItem
          icon={<Clock className="w-5 h-5" />}
          bgColor="bg-blue-500"
          days={mockTimeOffBalance.pendingDays}
          label="pending approval"
          sublabel="Awaiting manager approval"
        />
        <SummaryItem
          icon={<Calendar className="w-5 h-5" />}
          bgColor="bg-orange-500"
          days={mockTimeOffBalance.bookedDays}
          label="booked"
          sublabel={`${mockTimeOffBalance.usedDays}d used`}
        />
        <SummaryItem
          icon={<Briefcase className="w-5 h-5" />}
          bgColor="bg-teal-500"
          days={mockTimeOffBalance.contractDays}
          label="per year"
          sublabel="In the contract"
        />
        <SummaryItem
          icon={<Flag className="w-5 h-5" />}
          bgColor="bg-rose-400"
          days={mockTimeOffBalance.nationalHolidays}
          label="national holidays"
          sublabel="See holiday list"
          link="#"
        />
        
        <p className="text-sm text-muted-foreground pt-2">
          National holidays now appear directly on your calendar. To book regional and local holidays, you can click.
        </p>
        
        <Button className="w-full mt-2" size="lg">
          See More Here
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
