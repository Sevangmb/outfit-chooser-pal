import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface OutfitFeedProps {
  filter?: 'trending' | 'following';
}

export const OutfitFeed = ({ filter }: OutfitFeedProps) => {
  const { data: outfits } = useQuery({
    queryKey: ["outfits", filter],
    queryFn: async () => {
      let query = supabase
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

      if (filter === 'trending') {
        query = query.order('rating', { ascending: false });
      } else if (filter === 'following') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: following } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', user.id);
          
          if (following?.length) {
            query = query.in('user_id', following.map(f => f.following_id));
          }
        }
      }

      const { data, error } = await query;
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