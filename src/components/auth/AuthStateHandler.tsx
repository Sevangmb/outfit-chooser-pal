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
            console.error("Error checking profile for user:", session.user.id, "Error:", profileError);
            toast.error("Erreur lors de la vérification du profil. Veuillez réessayer.");
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
                  has_completed_onboarding: session.user.email === 'guest@fring.app' ? true : false,
                  status: 'active'
                }
              ]);

            if (insertError) {
              console.error("Error creating profile for user:", session.user.id, "Error:", insertError);
              toast.error("Erreur lors de la création du profil. Veuillez réessayer.");
              return;
            }
          }

          // Ensure user role exists
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert(
              { 
                user_id: session.user.id, 
                role: 'user' 
              },
              { 
                onConflict: 'user_id,role',
                ignoreDuplicates: true 
              }
            );

          if (roleError) {
            console.error("Error setting user role for user:", session.user.id, "Error:", roleError);
            toast.error("Erreur lors de la configuration du rôle. Veuillez réessayer.");
            return;
          }

          console.log("Profile setup completed:", existingProfile || "New profile created");
          toast.success("Connexion réussie !");
          navigate("/");
        } catch (error) {
          console.error("Unexpected error in auth flow for user:", session.user.id, "Error:", error);
          toast.error("Une erreur inattendue est survenue lors de l'authentification. Veuillez réessayer.");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        toast.info("Déconnexion réussie");
        navigate("/auth");
      } else if (event === "USER_DELETED") {
        console.log("User account deleted");
        toast.info("Compte supprimé");
        navigate("/auth");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [navigate]);
};