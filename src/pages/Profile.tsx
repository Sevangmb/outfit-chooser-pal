import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { FollowList } from "@/components/social/FollowList";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: followStats } = useQuery({
    queryKey: ["followStats", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { followers_count: 0, following_count: 0 };

      const [followers, following] = await Promise.all([
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("following_id", profile.id),
        supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", profile.id)
      ]);

      return {
        followers_count: followers.count || 0,
        following_count: following.count || 0
      };
    },
    enabled: !!profile?.id
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="container py-8 px-4 mx-auto mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src="https://images.unsplash.com/photo-1527576539890-dfa815648363" />
              <AvatarFallback>
                {profile?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-primary">{profile?.email}</h2>
              <p className="text-muted-foreground">
                Membre depuis le {new Date(profile?.created_at || "").toLocaleDateString()}
              </p>
              <div className="flex gap-4 justify-center mt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold">{followStats?.followers_count}</div>
                  <div className="text-sm text-muted-foreground">Abonnés</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{followStats?.following_count}</div>
                  <div className="text-sm text-muted-foreground">Abonnements</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {profile && <FollowList userId={profile.id} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;