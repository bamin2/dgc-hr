import { Monitor, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DesktopRequiredMessageProps {
  featureName?: string;
}

export function DesktopRequiredMessage({ featureName }: DesktopRequiredMessageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Monitor className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Desktop Access Required
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {featureName ? (
                <>
                  <span className="font-medium">{featureName}</span> is optimized for larger screens.
                </>
              ) : (
                "This feature is optimized for larger screens."
              )}
              {" "}Please access it from a desktop or laptop computer for the best experience.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
