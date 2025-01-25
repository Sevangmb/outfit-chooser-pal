import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

export const FeedHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <WeatherWidget />
      
      <Alert>
        <Trophy className="h-4 w-4" />
        <AlertDescription>
          Challenge en cours : Créez votre tenue d'automne !
          <Button variant="link" className="pl-2" onClick={() => navigate("/contest")}>
            Participer
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};