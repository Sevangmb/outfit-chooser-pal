import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const RecommendedOutfits = () => {
  const navigate = useNavigate();

  const { data: recommendedOutfits } = useQuery({
    queryKey: ["recommendedOutfits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get user preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id);

      // Get outfits matching preferences
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          profiles!outfits_profiles_user_id_fkey (
            id,
            username,
            email
          ),
          outfit_clothes (
            clothes (
              id,
              category,
              color
            )
          )
        `)
        .eq("is_flagged", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Filter outfits based on preferences if any exist
      if (preferences && preferences.length > 0) {
        return outfits.filter(outfit => {
          const outfitCategories = outfit.outfit_clothes.map(oc => oc.clothes.category);
          const outfitColors = outfit.outfit_clothes.map(oc => oc.clothes.color);
          
          return preferences.some(pref => 
            outfitCategories.includes(pref.category) || 
            outfitColors.includes(pref.color)
          );
        });
      }

      return outfits;
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recommendedOutfits?.map((outfit) => (
        <Card key={outfit.id} className="p-4">
          <h3 className="font-semibold">{outfit.name}</h3>
          <p className="text-sm text-muted-foreground">
            By {outfit.profiles?.username || "Unknown"}
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/outfit/${outfit.id}`)}
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};