import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const GuestLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      console.log("Attempting guest login...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'guest@fring.app',
        password: 'guest123'
      });

      if (error) {
        console.error("Guest login error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast.error(error.message || "Erreur lors de la connexion invité");
        return;
      }

      if (data?.user) {
        console.log("Guest login successful:", data.user);
        toast.success("Connexion invité réussie !");
        navigate("/");
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