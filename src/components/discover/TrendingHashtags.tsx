import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const TrendingHashtags = () => {
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      console.log("Fetching trending hashtags...");
      const { data, error } = await supabase
        .from("clothing_tags")
        .select("name, id")
        .limit(10);

      if (error) {
        console.error("Error fetching trending hashtags:", error);
        throw error;
      }

      console.log("Trending hashtags fetched:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Error in TrendingHashtags component:", error);
    return <div>Une erreur est survenue lors du chargement des hashtags tendances.</div>;
  }

  if (!tags?.length) {
    console.log("No trending hashtags found");
    return <div className="text-muted-foreground">Aucun hashtag tendance pour le moment</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags?.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="text-sm">
          #{tag.name}
        </Badge>
      ))}
    </div>
  );
};