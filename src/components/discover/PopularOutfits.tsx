import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const PopularOutfits = () => {
  const { data: outfits, isLoading, error } = useQuery({
    queryKey: ["popular-outfits"],
    queryFn: async () => {
      console.log("Fetching popular outfits...");
      const { data, error } = await supabase
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
        console.error("Error fetching popular outfits:", error);
        throw error;
      }

      console.log("Popular outfits fetched:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error in PopularOutfits component:", error);
    return <div>Une erreur est survenue lors du chargement des tenues populaires.</div>;
  }

  if (!outfits?.length) {
    console.log("No popular outfits found");
    return <div className="text-muted-foreground">Aucune tenue populaire pour le moment</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {outfits?.map((outfit) => (
        <div key={outfit.id} className="aspect-square bg-muted rounded-lg p-4">
          <h3 className="font-medium">{outfit.name}</h3>
          <p className="text-sm text-muted-foreground">Rating: {outfit.rating}</p>
        </div>
      ))}
    </div>
  );
};