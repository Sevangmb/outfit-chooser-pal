import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AuthForm = () => {
  const [loading, setLoading] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
      });

      if (error) {
        console.error("Facebook login error:", error);
        toast.error("Erreur lors de la connexion avec Facebook");
        return;
      }

      toast.success("Connexion Facebook réussie !");
    } catch (error) {
      console.error("Unexpected error during Facebook login:", error);
      toast.error("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <Button
        onClick={handleFacebookLogin}
        className="w-full"
        variant="outline"
        disabled={loading}
      >
        {loading ? "Chargement..." : "Se connecter avec Facebook"}
      </Button>
    </div>
  );
};

export default AuthForm;
