import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SecuritySettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const password = formData.get("new_password") as string;
      const confirmPassword = formData.get("confirm_password") as string;

      if (password !== confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Error updating password:", error);
        switch (error.code) {
          case "invalid_credentials":
            toast.error("Les identifiants de connexion sont incorrects");
            break;
          case "password_too_weak":
            toast.error("Le mot de passe est trop faible. Veuillez choisir un mot de passe plus fort.");
            break;
          case "network_error":
            toast.error("Erreur réseau. Veuillez vérifier votre connexion et réessayer.");
            break;
          default:
            toast.error(error.message || "Erreur lors de la mise à jour du mot de passe");
        }
        return;
      }

      toast.success("Mot de passe mis à jour avec succès");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Unexpected error occurred while updating password:", error);
      toast.error(error.message || "Une erreur inattendue est survenue lors de la mise à jour du mot de passe. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-medium">Changer le mot de passe</h3>
        
        <div className="space-y-2">
          <Label htmlFor="new_password">Nouveau mot de passe</Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          <Key className="w-4 h-4 mr-2" />
          {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Authentification à deux facteurs</h3>
        <Button variant="outline" className="w-full" disabled>
          <Shield className="w-4 h-4 mr-2" />
          Configurer l'authentification 2FA
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Appareils connectés</h3>
        <Button variant="outline" className="w-full" disabled>
          <Smartphone className="w-4 h-4 mr-2" />
          Gérer les appareils connectés
        </Button>
      </div>
    </div>
  );
};