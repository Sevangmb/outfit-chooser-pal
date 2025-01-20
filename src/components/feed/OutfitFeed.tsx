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
          ),
          profiles(email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching outfits:", error);
        throw error;
      }

      const formattedOutfits = outfits.map((outfit: any) => ({
        ...outfit,
        user_email: outfit.profiles?.email,
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