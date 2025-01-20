import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Follower } from "@/types/social";
import { FollowButton } from "./FollowButton";

interface FollowListProps {
  userId: string;
}

export const FollowList = ({ userId }: FollowListProps) => {
  const { data: followers = [], refetch: refetchFollowers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followers")
        .select(`
          *,
          profile:profiles(email)
        `)
        .eq("following_id", userId);

      if (error) throw error;
      return data as Follower[];
    },
  });

  const { data: following = [], refetch: refetchFollowing } = useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("followers")
        .select(`
          *,
          profile:profiles(email)
        `)
        .eq("follower_id", userId);

      if (error) throw error;
      return data as Follower[];
    },
  });

  const handleFollowChange = () => {
    refetchFollowers();
    refetchFollowing();
  };

  return (
    <Tabs defaultValue="followers" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="followers" className="flex-1">
          Abonnés ({followers.length})
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1">
          Abonnements ({following.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="followers" className="space-y-4">
        {followers.map((follower) => (
          <div key={follower.id} className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {follower.profile?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{follower.profile?.email}</span>
            </div>
            <FollowButton
              userId={follower.follower_id}
              isFollowing={following.some(f => f.following_id === follower.follower_id)}
              onFollowChange={handleFollowChange}
            />
          </div>
        ))}
        {followers.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun abonné</p>
        )}
      </TabsContent>

      <TabsContent value="following" className="space-y-4">
        {following.map((follow) => (
          <div key={follow.id} className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {follow.profile?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{follow.profile?.email}</span>
            </div>
            <FollowButton
              userId={follow.following_id}
              isFollowing={true}
              onFollowChange={handleFollowChange}
            />
          </div>
        ))}
        {following.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun abonnement</p>
        )}
      </TabsContent>
    </Tabs>
  );
};