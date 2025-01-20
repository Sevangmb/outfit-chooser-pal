import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { FollowList } from "@/components/social/FollowList";
import { ProfileStats } from "@/components/social/ProfileStats";
import { UserOutfits } from "@/components/social/UserOutfits";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="https://images.unsplash.com/photo-1527576539890-dfa815648363" />
                <AvatarFallback>
                  {profile?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-primary">{profile?.email}</h2>
                <p className="text-sm text-muted-foreground">
                  Membre depuis le {new Date(profile?.created_at || "").toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Paramètres</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile && (
              <>
                <ProfileStats userId={profile.id} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Mes tenues</h3>
                  <UserOutfits userId={profile.id} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Abonnements</h3>
                  <FollowList userId={profile.id} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;