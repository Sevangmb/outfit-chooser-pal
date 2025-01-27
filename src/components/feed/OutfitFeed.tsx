import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export const OutfitFeed = () => {
  const { data: outfits } = useQuery({
    queryKey: ["outfits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outfits")
        .select(`
          *,
          profiles!outfits_profiles_user_id_fkey (
            username,
            email
          ),
          clothes:outfit_clothes (
            clothes (
              id,
              name,
              category,
              color,
              image
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(9);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {outfits?.map((outfit) => (
        <Card key={outfit.id} className="p-4">
          <h3 className="font-semibold">{outfit.name}</h3>
          <p className="text-sm text-muted-foreground">
            By {outfit.profiles?.username || "Unknown"}
          </p>
          <div className="mt-2 space-y-1">
            {outfit.clothes?.map((item) => (
              <div key={item.clothes.id} className="text-sm">
                {item.clothes.name} ({item.clothes.color})
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};