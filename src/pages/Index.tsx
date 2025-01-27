import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FeedHeader } from "@/components/feed/FeedHeader";

export default function Index() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getOutfitSuggestion = async () => {
    try {
      setIsLoading(true);
      console.log("Starting outfit suggestion request...");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour obtenir une suggestion");
        return;
      }

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
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      console.log("Received suggestion:", data);
      setSuggestion(data.suggestion);
      toast.success("Suggestion générée avec succès !");

    } catch (error) {
      console.error('Error getting outfit suggestion:', error);
      toast.error("Erreur lors de la génération de la suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4 px-4 mx-auto mt-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              Fil d'actualité
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              Tendances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-4">
                <WeatherWidget />
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Suggestion tenue</h3>
                    <p className="text-sm text-muted-foreground">
                      Basée sur la météo et votre garde-robe
                    </p>
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
              </Card>
            </div>

            <FeedHeader />

            <div className={cn("rounded-lg", "bg-background")}>
              <OutfitFeed />
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="text-center p-8 text-muted-foreground">
              <p>Les tendances arrivent bientôt !</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}