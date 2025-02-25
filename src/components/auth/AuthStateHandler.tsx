
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthStateHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: any) => {
      console.log("Changement d'état d'authentification:", event, session);
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Erreur lors de la vérification du profil:", profileError);
            toast.error("Erreur lors de la vérification du profil");
            return;
          }

          if (!existingProfile) {
            console.log("Création d'un nouveau profil pour:", session.user.id);
            
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  username: session.user.email?.split('@')[0] || 'guest',
                  has_completed_onboarding: session.user.email === 'guest@fring.app'
                }
              ]);

            if (insertError) {
              console.error("Erreur lors de la création du profil:", insertError);
              toast.error("Erreur lors de la création du profil");
              return;
            }
          }

          toast.success("Connexion réussie !");
          navigate("/");
        } catch (error) {
          console.error("Erreur dans le flux d'authentification:", error);
          toast.error("Une erreur est survenue lors de l'authentification");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("Déconnexion de l'utilisateur");
        toast.info("Déconnexion réussie");
        navigate("/auth");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, [navigate]);
};
