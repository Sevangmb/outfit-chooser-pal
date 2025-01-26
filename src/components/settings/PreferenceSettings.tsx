import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Languages } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PreferenceSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: preferences } = useQuery({
    queryKey: ["user_preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_general_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data || {}; // Return empty object if no preferences exist
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const updates = {
        user_id: user.id,
        language: formData.get("language")?.toString(),
        currency: formData.get("currency")?.toString(),
        measurement_unit: formData.get("measurement_unit")?.toString(),
      };

      const { error } = await supabase
        .from("user_general_preferences")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Préférences mises à jour");
    },
    onError: (error) => {
      console.error("Error updating preferences:", error);
      toast.error("Erreur lors de la mise à jour des préférences");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await updatePreferencesMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">Langue</Label>
          <Select name="language" defaultValue={preferences?.language || "fr"}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Select name="currency" defaultValue={preferences?.currency || "EUR"}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar ($)</SelectItem>
              <SelectItem value="GBP">Livre sterling (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement_unit">Unité de mesure</Label>
          <Select name="measurement_unit" defaultValue={preferences?.measurement_unit || "metric"}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une unité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Métrique (cm, kg)</SelectItem>
              <SelectItem value="imperial">Impérial (in, lb)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          "Enregistrement..."
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les préférences
          </>
        )}
      </Button>
    </form>
  );
};