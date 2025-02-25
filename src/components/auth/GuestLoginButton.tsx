
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GuestLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      console.log("Tentative de connexion invité...");
      
      // First try to sign in with guest credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guest@fring.app',
        password: 'guest123',
      });

      if (error) {
        console.error("Erreur de connexion invité:", error);
        toast.error("Erreur lors de la connexion en tant qu'invité");
        return;
      }

      if (data?.user) {
        console.log("Connexion invité réussie:", data.user);
        toast.success("Connexion invité réussie!");
      }

    } catch (error) {
      console.error("Erreur inattendue:", error);
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
