import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { AIFeatures } from "@/components/feed/AIFeatures";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { Button } from "@/components/ui/button";
import { LayoutList, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
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
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            Fil d'actualité
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Suggestions IA
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendances
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Défis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
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
          <OutfitFeed />
        </TabsContent>

        <TabsContent value="suggestions">
          <AIFeatures />
        </TabsContent>

        <TabsContent value="trends">
          <div className="text-center py-12 text-muted-foreground">
            Les tendances seront bientôt disponibles
          </div>
        </TabsContent>

        <TabsContent value="challenges">
          <div className="text-center py-12 text-muted-foreground">
            Les défis seront bientôt disponibles
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;