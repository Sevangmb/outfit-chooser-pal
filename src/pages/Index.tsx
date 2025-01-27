import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getOutfitSuggestion = async () => {
    try {
      setIsLoading(true);
      console.log("Starting outfit suggestion request...");

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
      toast.success("Suggestion générée avec succès !");

    } catch (error) {
      console.error('Error getting outfit suggestion:', error);
      toast.error("Erreur lors de la génération de la suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Mon Dressing</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-background to-muted/50">
            <WeatherWidget />
            <div className="mt-6 pt-6 border-t">
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
                  className="hover:bg-primary/10"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg transition-all",
                suggestion ? "bg-primary/5" : "bg-muted"
              )}>
                {suggestion ? (
                  <p className="text-sm">{suggestion}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Cliquez sur l'icône pour obtenir une suggestion
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/5 to-background">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-accent" />
              <h3 className="font-medium">Challenge en cours</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre tenue d'automne !
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/contest")}>
              Participer
            </Button>
          </Card>
        </div>

        {/* Main Feed Area */}
        <div className="md:col-span-8">
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
              <OutfitFeed />
            </TabsContent>

            <TabsContent value="trends">
              <div className="text-center py-12 text-muted-foreground">
                Les tendances seront bientôt disponibles
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;