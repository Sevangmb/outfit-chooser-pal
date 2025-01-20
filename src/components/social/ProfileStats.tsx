import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileStatsProps {
  userId: string;
}

export const ProfileStats = ({ userId }: ProfileStatsProps) => {
  const { data: stats } = useQuery({
    queryKey: ["profileStats", userId],
    queryFn: async () => {
      const [followers, following, outfits] = await Promise.all([
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("following_id", userId),
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", userId),
        supabase
          .from("outfits")
          .select("*", { count: "exact" })
          .eq("user_id", userId)
      ]);

      return {
        followers: followers.count || 0,
        following: following.count || 0,
        outfits: outfits.count || 0
      };
    }
  });

  return (
    <div className="flex justify-around py-4 border-y border-border">
      <div className="text-center">
        <div className="text-2xl font-semibold text-primary">{stats?.outfits || 0}</div>
        <div className="text-sm text-muted-foreground">Tenues</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-primary">{stats?.followers || 0}</div>
        <div className="text-sm text-muted-foreground">Abonnés</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold text-primary">{stats?.following || 0}</div>
        <div className="text-sm text-muted-foreground">Abonnements</div>
      </div>
    </div>
  );
};