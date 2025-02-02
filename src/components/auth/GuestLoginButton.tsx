import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GuestLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      console.log("Starting guest login attempt with magic link...");
      
      // Send magic link to guest email
      const { error } = await supabase.auth.signInWithOtp({
        email: 'guest@fring.app',
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Error sending magic link:", error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Les identifiants du compte invité sont incorrects");
        } else {
          toast.error("Erreur lors de l'envoi du lien magique: " + error.message);
        }
        return;
      }

      toast.success("Lien magique envoyé à l'email invité!");
    } catch (error) {
      console.error("Unexpected error during guest login:", error);
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
      {loading ? "Chargement..." : "Envoyer un lien magique"}
    </Button>
  );
};