import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ClothingItem {
  id: number;
  name: string;
  selling_price: number | null;
}

export const PopularItems = () => {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ["popular-items"],
    queryFn: async () => {
      console.log("Fetching popular items...");
      const { data, error } = await supabase
        .from("clothes")
        .select("id, name, selling_price")
        .eq("is_for_sale", true)
        .order("rating", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching popular items:", error);
        throw error;
      }
      
      console.log("Popular items fetched:", data);
      return data as ClothingItem[];
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
    console.error("Error in PopularItems component:", error);
    return <div>Une erreur est survenue lors du chargement des articles populaires.</div>;
  }

  if (!items?.length) {
    console.log("No popular items found");
    return <div className="text-muted-foreground">Aucun article populaire pour le moment</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items?.map((item) => (
        <div key={item.id} className="aspect-square bg-muted rounded-lg p-4">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            {item.selling_price ? `${item.selling_price} €` : "Prix non défini"}
          </p>
        </div>
      ))}
    </div>
  );
};