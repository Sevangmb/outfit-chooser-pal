import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Listen for auth state changes with improved error handling
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session);
    
    if (event === "SIGNED_IN" && session?.user) {
      try {
        setLoading(true);
        
        // First check if profile exists
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

        // If profile doesn't exist, create it
        if (!existingProfile) {
          console.log("Creating new profile for user:", session.user.id);
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split('@')[0],
              }
            ]);

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Erreur lors de la création du profil");
            return;
          }
        }

        console.log("Profile verified:", existingProfile || "New profile created");
        toast.success("Connexion réussie !");
        navigate("/");
      } catch (error) {
        console.error("Error in auth flow:", error);
        toast.error("Une erreur est survenue lors de l'authentification");
      } finally {
        setLoading(false);
      }
    } else if (event === "SIGNED_OUT") {
      console.log("User signed out");
      toast.info("Déconnexion réussie");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Bienvenue sur FRING!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous ou créez un compte pour continuer
          </p>
        </div>

        <div className="mt-8 bg-card p-6 rounded-lg shadow-sm border">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'w-full',
                label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              },
            }}
            providers={["google"]}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                  button_label: "Se connecter",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                  button_label: "S'inscrire",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;