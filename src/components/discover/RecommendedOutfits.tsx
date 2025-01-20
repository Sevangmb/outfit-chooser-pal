import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const RecommendedOutfits = () => {
  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      console.log("Fetching user preferences...");
      const { data: preferences, error } = await supabase
        .from("user_preferences")
        .select("*");

      if (error) {
        console.error("Error fetching user preferences:", error);
        throw error;
      }

      return preferences;
    },
  });

  const { data: recommendedOutfits = [], isLoading } = useQuery({
    queryKey: ["recommended-outfits", userPreferences],
    queryFn: async () => {
      if (!userPreferences?.length) return [];

      console.log("Fetching recommended outfits...");
      const preferredCategories = userPreferences.map((pref) => pref.category);
      const preferredColors = userPreferences.map((pref) => pref.color);

      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("rating", { ascending: false })
        .limit(6);

      if (outfitsError) {
        console.error("Error fetching recommended outfits:", outfitsError);
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

      // Filter and sort outfits based on preferences
      const outfitsWithScores = outfitsData.map((outfit: any) => {
        const clothes = outfit.clothes.map((item: any) => item.clothes);
        const preferenceScore = clothes.reduce((score: number, clothing: any) => {
          if (preferredCategories.includes(clothing.category)) score += 1;
          if (preferredColors.includes(clothing.color)) score += 1;
          return score;
        }, 0);

        return {
          ...outfit,
          user_email: emailMap.get(outfit.user_id),
          clothes: outfit.clothes.map((item: any) => ({
            clothes: item.clothes,
          })),
          preferenceScore,
        };
      });

      return outfitsWithScores
        .sort((a, b) => b.preferenceScore - a.preferenceScore)
        .slice(0, 6);
    },
    enabled: !!userPreferences?.length,
  });

  if (!userPreferences?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recommandés pour vous</h2>
      {isLoading ? (
        <div className="text-center py-8">Chargement des recommandations...</div>
      ) : recommendedOutfits.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedOutfits.map((outfit: Outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucune recommandation disponible
        </div>
      )}
    </div>
  );
};