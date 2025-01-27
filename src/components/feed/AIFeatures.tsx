import { Button } from "@/components/ui/button";
import { Search, CloudSun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AIFeatures = () => {
  const navigate = useNavigate();
  
  const handleWeatherOutfitSuggestion = () => {
    const weatherData = localStorage.getItem('weatherData');
    if (!weatherData) {
      toast.error("Les données météo ne sont pas disponibles");
      return;
    }
    
    navigate("/discover", { 
      state: { 
        suggestOutfit: true,
        weatherData: JSON.parse(weatherData)
      } 
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
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

      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-auto py-4"
        onClick={handleWeatherOutfitSuggestion}
      >
        <CloudSun className="h-4 w-4" />
        <div className="text-left">
          <div className="font-medium">Suggestion météo</div>
          <div className="text-sm text-muted-foreground">Tenue adaptée à la météo</div>
        </div>
      </Button>
    </div>
  );
};