import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const PopularItems = () => {
  const { data: items, isLoading } = useQuery({
    queryKey: ["popular-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothes")
        .select("*")
        .eq("is_for_sale", true)
        .order("rating", { ascending: false })
        .limit(6);

      if (error) throw error;
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items?.map((item) => (
        <div key={item.id} className="aspect-square bg-muted rounded-lg p-4">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.price} €</p>
        </div>
      ))}
    </div>
  );
};