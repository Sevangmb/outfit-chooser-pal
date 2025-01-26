import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const TrendingHashtags = () => {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clothing_tags")
        .select("name, id")
        .limit(10);

      if (error) throw error;
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