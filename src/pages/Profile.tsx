import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { FavoriteOutfits } from "@/components/FavoriteOutfits";
import { Button } from "@/components/ui/button";
import { HelpCircle, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Vous avez été déconnecté");
      navigate("/landing");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

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
        <Card>
          <CardContent className="p-6">
            <ProfileHeader 
              email={profile.email}
              createdAt={profile.created_at}
              isAdmin={isAdmin || false}
            />

            <Tabs defaultValue="profile" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">
                  <User className="w-4 h-4 mr-2" />
                  Mon Profil
                </TabsTrigger>
                <TabsTrigger value="favorites">
                  Mes Favoris
                </TabsTrigger>
                <TabsTrigger value="settings" onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileContent userId={profile.id} />
              </TabsContent>

              <TabsContent value="favorites">
                <FavoriteOutfits />
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open("/help", "_blank")}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Aide & Support
              </Button>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;