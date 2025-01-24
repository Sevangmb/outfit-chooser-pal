import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          // Try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Error refreshing session:", refreshError);
            toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
            // Clear any existing session data
            await supabase.auth.signOut();
            return;
          }
          if (refreshData.session) {
            console.log("Session refreshed successfully");
            navigate("/");
            return;
          }
        }

        if (session) {
          console.log("Valid session found, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        toast.error("Une erreur est survenue lors de la vérification de la session");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to home");
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        // Clear any remaining session data
        await supabase.auth.signOut();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
          <p className="text-muted-foreground">
            Connectez-vous ou créez un compte pour continuer
          </p>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90',
              input: 'w-full px-3 py-2 border rounded-md',
            }
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/`}
        />
      </div>
    </div>
  );
};

export default Auth;