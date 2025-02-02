import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isUserLoggedIn = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error("Error checking user login status:", error);
      toast.error("Erreur lors de la vérification de l'état de connexion.");
      return false;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error("Error sending magic link:", error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Les identifiants sont incorrects. Veuillez réessayer.");
        } else {
          toast.error("Erreur lors de l'envoi du lien magique: " + error.message);
        }
        throw error;
      }
    } catch (error) {
      console.error("Unexpected error sending magic link:", error);
      toast.error("Une erreur inattendue s'est produite lors de l'envoi du lien magique.");
      throw error;
    }
  };

  const verifyMagicLink = async (accessToken: string) => {
    try {
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token: accessToken,
        type: 'magiclink',
      });
      if (error) {
        console.error("Error verifying magic link:", error);
        if (error.message.includes('Invalid or expired token')) {
          toast.error("Le lien magique est invalide ou a expiré.");
        } else {
          toast.error("Erreur lors de la vérification du lien magique: " + error.message);
        }
        throw error;
      }
      setUser(session?.user ?? null);
    } catch (error) {
      console.error("Unexpected error verifying magic link:", error);
      toast.error("Une erreur inattendue s'est produite lors de la vérification du lien magique.");
      throw error;
    }
  };

  return { user, loading, sendMagicLink, verifyMagicLink, isUserLoggedIn };
};