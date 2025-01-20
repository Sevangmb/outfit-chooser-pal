import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { OutfitCard } from "@/components/feed/OutfitCard";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  user_id: string;
  rating: number;
  created_at: string;
  user_email?: string;
  clothes: {
    clothes: {
      id: number;
      name: string;
      category: string;
      color: string;
      image: string | null;
    };
  }[];
}

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trendingOutfits = [], isLoading: isTrendingLoading } = useQuery({
    queryKey: ["trending-outfits"],
    queryFn: async () => {
      console.log("Fetching trending outfits...");
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("rating", { ascending: false })
        .limit(9);

      if (outfitsError) {
        console.error("Error fetching trending outfits:", outfitsError);
        throw outfitsError;
      }

      // Fetch user emails
      const userIds = outfitsData.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      return outfitsData.map((outfit: any) => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id),
        clothes: outfit.clothes.map((item: any) => ({
          clothes: item.clothes,
        })),
      }));
    },
  });

  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
    queryKey: ["search-outfits", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      console.log("Searching outfits...");
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (outfitsError) {
        console.error("Error searching outfits:", outfitsError);
        throw outfitsError;
      }

      // Fetch user emails
      const userIds = outfitsData.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      return outfitsData.map((outfit: any) => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id),
        clothes: outfit.clothes.map((item: any) => ({
          clothes: item.clothes,
        })),
      }));
    },
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="container py-8 px-4 mx-auto mt-16">
        <h1 className="text-2xl font-bold mb-6">Découvrir</h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher des tenues..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="trending" className="flex-1">Tendances</TabsTrigger>
            <TabsTrigger value="search" className="flex-1">Recherche</TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingOutfits.map((outfit: Outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
              {isTrendingLoading && (
                <div className="col-span-full text-center">
                  Chargement des tendances...
                </div>
              )}
              {!isTrendingLoading && trendingOutfits.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  Aucune tenue tendance pour le moment
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((outfit: Outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
              {isSearchLoading && (
                <div className="col-span-full text-center">
                  Recherche en cours...
                </div>
              )}
              {!isSearchLoading && searchQuery && searchResults.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">
                  Aucun résultat trouvé pour "{searchQuery}"
                </div>
              )}
              {!searchQuery && (
                <div className="col-span-full text-center text-muted-foreground">
                  Commencez à taper pour rechercher des tenues
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Discover;