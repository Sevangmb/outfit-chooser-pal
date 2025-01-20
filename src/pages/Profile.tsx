import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FollowList } from "@/components/social/FollowList";
import { ProfileStats } from "@/components/social/ProfileStats";
import { UserOutfits } from "@/components/social/UserOutfits";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur lors de la récupération de la session");
        throw error;
      }
      return session;
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      console.log("Fetching profile for user:", session.user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erreur lors du chargement du profil");
        throw error;
      }

      if (!data) {
        console.log("No profile found, creating one...");
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ 
            id: session.user.id, 
            email: session.user.email 
          }])
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          toast.error("Erreur lors de la création du profil");
          throw createError;
        }

        return newProfile;
      }

      return data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["userRole", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        toast.error("Erreur lors de la vérification des droits d'accès");
        return false;
      }

      return data?.role === "admin";
    },
    enabled: !!profile?.id
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-primary">Profil non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8 px-4 mx-auto mt-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="https://images.unsplash.com/photo-1527576539890-dfa815648363" />
                <AvatarFallback>
                  {profile.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-primary">{profile.email}</h2>
                <p className="text-sm text-muted-foreground">
                  Membre depuis le {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/admin")}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Shield className="h-4 w-4" />
                  <span className="sr-only">Administration</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/settings")}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Paramètres</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;