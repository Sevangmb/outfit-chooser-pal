import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FeedHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <Trophy className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span>Challenge en cours : Créez votre tenue d'automne !</span>
          <Button variant="link" className="text-primary" onClick={() => navigate("/contest")}>
            Participer
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};