import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Compass, MapPin, Search, Sparkles, Store, TrendingUp, Users, BarChart, Hash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendedOutfits } from "@/components/discover/RecommendedOutfits";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopSection } from "@/components/shop/ShopSection";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTab, setTrendingTab] = useState("outfits");

  const { data: trendingOutfits, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["trending-outfits"],
    queryFn: async () => {
      console.log("Fetching trending outfits...");
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("rating", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching trending outfits:", error);
        throw error;
      }

      return outfits;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentOutfits, isLoading: isRecentLoading } = useQuery({
    queryKey: ["recent-outfits"],
    queryFn: async () => {
      console.log("Fetching recent outfits...");
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching recent outfits:", error);
        throw error;
      }

      return outfits;
    },
    staleTime: 2 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container py-8 px-4 mx-auto space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Compass className="h-12 w-12 text-primary" />
          </div>
          <div className="w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des vêtements, tenues, utilisateurs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Users className="h-4 w-4" />
              Style Match
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Nouveautés
            </TabsTrigger>
            <TabsTrigger value="shops" className="gap-2">
              <Store className="h-4 w-4" />
              Boutiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <Tabs value={trendingTab} onValueChange={setTrendingTab} className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="outfits" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tenues populaires
                </TabsTrigger>
                <TabsTrigger value="articles" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Articles populaires
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags populaires
                </TabsTrigger>
              </TabsList>

              <TabsContent value="outfits">
                {isTrendingLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-[400px] rounded-xl" />
                    ))}
                  </div>
                ) : trendingOutfits?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune tenue populaire disponible pour le moment
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="articles">
                <div className="text-center py-8 text-muted-foreground">
                  Articles populaires des boutiques à venir
                </div>
              </TabsContent>

              <TabsContent value="hashtags">
                <div className="text-center py-8 text-muted-foreground">
                  Hashtags populaires à venir
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendedOutfits />
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <h2 className="text-xl font-semibold">Derniers ajouts</h2>
            {isRecentLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[400px] rounded-xl" />
                ))}
              </div>
            ) : recentOutfits?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun nouvel ajout pour le moment
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="shops">
            <ShopSection />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Discover;