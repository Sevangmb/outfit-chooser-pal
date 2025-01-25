import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const FeedHeader = () => {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState<string | null>(null);
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

      setSuggestion(data.suggestion);

    } catch (error) {
      console.error('Error getting outfit suggestion:', error);
      toast.error("Erreur lors de la génération de la suggestion");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <WeatherWidget />
      
      <div className="flex flex-col gap-4">
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

        {suggestion && (
          <Alert>
            <AlertDescription className="whitespace-pre-line">
              {suggestion}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
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