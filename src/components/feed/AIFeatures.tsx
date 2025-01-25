import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AIFeatures = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const getOutfitSuggestion = async () => {
    try {
      setIsLoading(true);

      // Get weather data from the WeatherWidget's last fetch
      const weatherDataStr = localStorage.getItem('weatherData');
      if (!weatherDataStr) {
        toast.error("Impossible de récupérer les données météo");
        return;
      }

      const weatherData = JSON.parse(weatherDataStr);
      
      const { data, error } = await supabase.functions.invoke('suggest-outfit', {
        body: {
          temperature: weatherData.temperature,
          weatherDescription: weatherData.description
        }
      });

      if (error) throw error;

      toast.success(data.suggestion, {
        duration: 6000,
      });

    } catch (error) {
      console.error('Error getting outfit suggestion:', error);
      toast.error("Erreur lors de la génération de la suggestion");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-auto py-4"
        onClick={getOutfitSuggestion}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <div className="text-left">
          <div className="font-medium">Suggestions IA</div>
          <div className="text-sm text-muted-foreground">Basées sur la météo</div>
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