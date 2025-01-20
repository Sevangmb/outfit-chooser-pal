import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OutfitCard } from "./OutfitCard";
import { Skeleton } from "@/components/ui/skeleton";

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

export const OutfitFeed = () => {
  const { data: outfits = [], isLoading } = useQuery({
    queryKey: ["outfits-feed"],
    queryFn: async () => {
      console.log("Fetching outfits for feed...");
      
      // First, fetch outfits with their clothes
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("created_at", { ascending: false });

      if (outfitsError) {
        console.error("Error fetching outfits:", outfitsError);
        throw outfitsError;
      }

      console.log("Fetched outfits:", outfitsData);

      // Then, fetch profiles for all user_ids
      const userIds = outfitsData.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Create a map of user_id to email
      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      // Combine the data
      const formattedOutfits = outfitsData.map((outfit: any) => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id),
        clothes: outfit.clothes.map((item: any) => ({
          clothes: item.clothes,
        })),
      }));

      console.log("Formatted outfits:", formattedOutfits);
      return formattedOutfits;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
};