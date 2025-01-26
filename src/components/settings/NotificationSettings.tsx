import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Save } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["notification_settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const updates = {
        new_followers: formData.get("new_followers") === "on",
        new_likes: formData.get("new_likes") === "on",
        new_comments: formData.get("new_comments") === "on",
        messages: formData.get("messages") === "on",
        system_updates: formData.get("system_updates") === "on",
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert({ user_id: user.id, ...updates });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Paramètres de notification mis à jour");
    },
    onError: (error) => {
      console.error("Error updating notification settings:", error);
      toast.error("Erreur lors de la mise à jour des paramètres");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await updateSettingsMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Nouveaux abonnés</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir une notification quand quelqu'un vous suit
            </p>
          </div>
          <Switch name="new_followers" defaultChecked={settings?.new_followers} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>J'aime reçus</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir une notification pour les j'aime sur vos tenues
            </p>
          </div>
          <Switch name="new_likes" defaultChecked={settings?.new_likes} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Commentaires</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir une notification pour les nouveaux commentaires
            </p>
          </div>
          <Switch name="new_comments" defaultChecked={settings?.new_comments} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Messages</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir une notification pour les nouveaux messages
            </p>
          </div>
          <Switch name="messages" defaultChecked={settings?.messages} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Mises à jour système</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir les notifications sur les mises à jour de l'application
            </p>
          </div>
          <Switch name="system_updates" defaultChecked={settings?.system_updates} />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          "Enregistrement..."
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les paramètres
          </>
        )}
      </Button>
    </form>
  );
};