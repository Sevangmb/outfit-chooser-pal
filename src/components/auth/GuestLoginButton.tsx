import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GuestLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      console.log("Attempting guest login...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guest@fring.app',
        password: 'guest123'
      });

      if (error) {
        console.error("Guest login error:", error);
        if (error.message.includes('Database error')) {
          toast.error("Erreur de connexion à la base de données. Veuillez réessayer plus tard.");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("L'email du compte invité n'est pas confirmé");
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error("Le compte invité n'existe pas ou les identifiants sont incorrects");
        } else {
          toast.error(error.message || "Erreur lors de la connexion invité");
        }
        return;
      }

      if (data?.user) {
        console.log("Guest login successful:", data.user);
        toast.success("Connexion invité réussie!");
      }
    } catch (error) {
      console.error("Unexpected error in guest login:", error);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGuestLogin}
      className="w-full"
      variant="outline"
      disabled={loading}
    >
      {loading ? "Chargement..." : "Continuer en tant qu'invité"}
    </Button>
  );
};