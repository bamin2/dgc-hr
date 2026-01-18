import { Link } from "react-router-dom";
import { UserCircle, Calendar, CheckSquare, BookUser } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  {
    icon: UserCircle,
    title: "My Profile",
    description: "View and update your profile",
    path: "/my-profile",
  },
  {
    icon: Calendar,
    title: "Time Off",
    description: "Request and manage leave",
    path: "/time-off",
  },
  {
    icon: CheckSquare,
    title: "Approvals",
    description: "Track your requests",
    path: "/approvals",
  },
  {
    icon: BookUser,
    title: "Directory",
    description: "Find colleagues",
    path: "/directory",
  },
];

export function QuickLinksSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickLinks.map((link) => (
        <Link key={link.path} to={link.path}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <link.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{link.title}</h3>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
