import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthStateHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          console.log("Checking profile for user:", session.user.id);
          
          const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error checking profile:", profileError);
            toast.error("Erreur lors de la vérification du profil");
            return;
          }

          if (!existingProfile) {
            console.log("Creating new profile for user:", session.user.id);
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  username: session.user.email?.split('@')[0],
                  has_completed_onboarding: false,
                  status: 'active'
                }
              ]);

            if (insertError) {
              console.error("Error creating profile:", insertError);
              toast.error("Erreur lors de la création du profil");
              return;
            }
          }

          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert(
              { 
                user_id: session.user.id, 
                role: 'user' 
              },
              { 
                onConflict: 'user_id',
                ignoreDuplicates: true 
              }
            );

          if (roleError) {
            console.error("Error setting user role:", roleError);
            toast.error("Erreur lors de la configuration du rôle");
            return;
          }

          console.log("Profile setup completed:", existingProfile || "New profile created");
          toast.success("Connexion réussie !");
          navigate("/");
        } catch (error) {
          console.error("Error in auth flow:", error);
          toast.error("Une erreur est survenue lors de l'authentification");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        toast.info("Déconnexion réussie");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [navigate]);
};