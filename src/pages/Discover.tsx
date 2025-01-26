import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { 
  Compass, 
  MapPin, 
  Search, 
  Sparkles, 
  Store, 
  TrendingUp, 
  Users, 
  BarChart, 
  Hash,
  Heart,
  Camera,
  Shirt,
  Star 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendedOutfits } from "@/components/discover/RecommendedOutfits";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopSection } from "@/components/shop/ShopSection";
import { ClothingTab } from "@/components/ClothingTab";

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

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container py-8 px-4 mx-auto space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Shirt className="h-12 w-12 text-primary" />
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

        <Tabs defaultValue="wardrobe" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="wardrobe" className="gap-2">
              <Shirt className="h-4 w-4" />
              Ma Garde-Robe
            </TabsTrigger>
            <TabsTrigger value="outfits" className="gap-2">
              <Heart className="h-4 w-4" />
              Mes Tenues
            </TabsTrigger>
            <TabsTrigger value="looks" className="gap-2">
              <Camera className="h-4 w-4" />
              Mes Looks
            </TabsTrigger>
            <TabsTrigger value="suitcases" className="gap-2">
              <Star className="h-4 w-4" />
              Mes Valises
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="h-4 w-4" />
              Mes Favoris
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wardrobe">
            <ClothingTab showFriendsClothes={false} />
          </TabsContent>

          <TabsContent value="outfits">
            <div className="text-center py-8 text-muted-foreground">
              Mes tenues à venir
            </div>
          </TabsContent>

          <TabsContent value="looks">
            <div className="text-center py-8 text-muted-foreground">
              Mes looks à venir
            </div>
          </TabsContent>

          <TabsContent value="suitcases">
            <div className="text-center py-8 text-muted-foreground">
              Mes valises à venir
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-8 text-muted-foreground">
              Mes favoris à venir
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Discover;