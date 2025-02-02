import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { GuestLoginButton } from "@/components/auth/GuestLoginButton";
import { useAuthStateHandler } from "@/components/auth/AuthStateHandler";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const { isUserLoggedIn } = useAuth();
  const navigate = useNavigate();

  useAuthStateHandler();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isUserLoggedIn();
      if (loggedIn) {
        navigate("/");
      }
            onError={(error) => {
              console.error("Authentication error:", error);
              if (error.message.includes('Invalid login credentials')) {
                toast.error("Les identifiants sont incorrects. Veuillez réessayer.");
              } else {
                toast.error("Une erreur est survenue lors de la connexion: " + error.message);
              }
            }}
    };

    checkLoginStatus();
  }, [isUserLoggedIn, navigate]);

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

        <div className="mt-8 bg-card p-6 rounded-lg shadow-sm border space-y-6">
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
            providers={["github", "google"]}
            redirectTo={window.location.origin}
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
                magic_link: {
                  email_input_label: "Entrez votre email pour recevoir un lien magique",
                  button_label: "Envoyer le lien magique",
                  link_text: "Se connecter avec un lien magique",
                },
              },
            }}
            magicLink
            onError={(error) => {
              if (error.message.includes('Invalid login credentials')) {
                toast.error("Les identifiants sont incorrects. Veuillez réessayer.");
              } else {
                toast.error("Une erreur est survenue lors de la connexion: " + error.message);
              }
            }}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou</span>
            </div>
          </div>

          <GuestLoginButton />
        </div>
      </div>
    </div>
  );
};

export default Auth;