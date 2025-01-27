import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserX } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PrivacySettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["privacy_settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const updates = {
        is_profile_public: formData.get("is_profile_public") === "on",
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Paramètres de confidentialité mis à jour");
    },
    onError: (error) => {
      console.error("Error updating privacy settings:", error);
      toast.error("Erreur lors de la mise à jour des paramètres");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await updatePrivacyMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Profil public</Label>
            <p className="text-sm text-muted-foreground">
              Permettre aux autres utilisateurs de voir votre profil
            </p>
          </div>
          <Switch
            name="is_profile_public"
            defaultChecked={profile?.is_profile_public}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Utilisateurs bloqués</Label>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Vous n'avez bloqué aucun utilisateur
          </p>
        </div>
        <Button variant="outline" className="w-full" type="button">
          <UserX className="w-4 h-4 mr-2" />
          Gérer les utilisateurs bloqués
        </Button>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Enregistrement..." : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
};
