import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyFeed = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Home className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Bienvenue sur votre fil d'actualité</h2>
        <p className="text-muted-foreground max-w-sm">
          Commencez à suivre d'autres utilisateurs ou explorez de nouvelles tenues pour personnaliser votre fil
        </p>
      </div>
      <Button 
        onClick={() => navigate("/discover")}
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        Explorer les tenues
      </Button>
    </div>
  );
};