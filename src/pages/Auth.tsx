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
          console.error("Erreur lors de la vérification de la session:", error);
          toast.error("Erreur d'authentification. Veuillez réessayer.");
          return;
        }

        if (session) {
          console.log("Session valide trouvée, redirection vers l'accueil");
          navigate("/");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("État de l'authentification changé:", event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Vérifier si l'utilisateur existe déjà dans la table des profils
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          // Si le profil n'existe pas, on le crée
          if (profileError?.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split('@')[0],
                has_completed_onboarding: false
              });

            if (insertError) {
              console.error("Erreur lors de la création du profil:", insertError);
              return;
            }
          }

          // Vérifier si l'utilisateur a un rôle
          const { error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          // Si l'utilisateur n'a pas de rôle, on lui attribue le rôle 'user'
          if (roleError?.code === 'PGRST116') {
            const { error: insertRoleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: session.user.id,
                role: 'user'
              });

            if (insertRoleError) {
              console.error("Erreur lors de l'attribution du rôle:", insertRoleError);
              return;
            }
          }

          toast.success("Connexion réussie");
          navigate("/");
        } catch (error) {
          console.error("Erreur lors du processus d'authentification:", error);
          toast.error("Une erreur est survenue lors de la connexion");
        }
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