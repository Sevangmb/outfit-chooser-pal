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
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching outfits:", error);
        throw error;
      }

      // Fetch user emails in a separate query
      const userIds = outfits.map((outfit: any) => outfit.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Create a map of user_id to email
      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]));

      const formattedOutfits = outfits.map((outfit: any) => ({
        ...outfit,
        user_email: emailMap.get(outfit.user_id),
        clothes: outfit.clothes.map((item: any) => ({
          clothes: item.clothes,
        })),
      }));

      console.log("Fetched outfits:", formattedOutfits);
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