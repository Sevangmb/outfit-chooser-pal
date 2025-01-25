import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

export const FeedHeader = () => {
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getOutfitSuggestion = async () => {
    try {
      setIsLoading(true);

      const weatherDataStr = localStorage.getItem('weatherData');
      if (!weatherDataStr) {
        toast.error("Impossible de récupérer les données météo");
        return;
      }

      const weatherData = JSON.parse(weatherDataStr);
      console.log("Weather data for suggestion:", weatherData);
      
      const { data, error } = await supabase.functions.invoke('suggest-outfit', {
        body: {
          temperature: weatherData.temperature,
          weatherDescription: weatherData.description,
          conditions: weatherData.conditions
        }
      });

      if (error) {
        console.error("Error getting suggestion:", error);
        throw error;
      }

      console.log("Received suggestion:", data);
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
      <div className="space-y-4">
        <Card className="p-4">
          <WeatherWidget />
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Suggestion tenue</h3>
                <p className="text-sm text-muted-foreground">Basée sur la météo</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={getOutfitSuggestion}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {suggestion ? (
              <p className="text-sm">{suggestion}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Cliquez sur l'icône pour obtenir une suggestion
              </p>
            )}
          </div>
        </Card>
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