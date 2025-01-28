import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GuestLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      console.log("Starting guest login attempt...");
      
      // First check if the guest user exists
      const { data: userExists, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'guest@fring.app')
        .maybeSingle();

      if (checkError) {
        console.error("Error checking guest user:", checkError);
        toast.error("Erreur lors de la vérification du compte invité");
        return;
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guest@fring.app',
        password: 'guest123',
      });

      if (error) {
        console.error("Guest login error:", error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Les identifiants du compte invité sont incorrects");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Le compte invité n'est pas confirmé");
        } else if (error.message.includes('Database error')) {
          toast.error("Erreur de base de données. Veuillez réessayer.");
        } else {
          toast.error("Erreur lors de la connexion invité: " + error.message);
        }
        return;
      }

      if (data?.user) {
        console.log("Guest login successful:", data.user);
        toast.success("Connexion invité réussie!");
      }
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
      {loading ? "Chargement..." : "Continuer en tant qu'invité"}
    </Button>
  );
};