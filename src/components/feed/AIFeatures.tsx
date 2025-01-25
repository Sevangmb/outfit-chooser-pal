import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AIFeatures = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-auto py-4"
        onClick={() => toast.info("Suggestions IA bientôt disponibles")}
      >
        <div className="text-left">
          <div className="font-medium">Suggestions IA</div>
          <div className="text-sm text-muted-foreground">Basées sur vos préférences</div>
        </div>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-auto py-4"
        onClick={() => navigate("/discover")}
      >
        <Search className="h-4 w-4" />
        <div className="text-left">
          <div className="font-medium">Explorer</div>
          <div className="text-sm text-muted-foreground">Découvrir de nouvelles tenues</div>
        </div>
      </Button>
    </div>
  );
};