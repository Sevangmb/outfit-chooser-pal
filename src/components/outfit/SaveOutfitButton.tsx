import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SaveOutfitButtonProps {
  selectedTop: number | null;
  selectedBottom: number | null;
  selectedShoes: number | null;
}

export const SaveOutfitButton = ({ selectedTop, selectedBottom, selectedShoes }: SaveOutfitButtonProps) => {
  const saveOutfit = async () => {
    if (!selectedTop || !selectedBottom || !selectedShoes) {
      toast.error("Veuillez sélectionner un vêtement pour chaque catégorie");
      return;
    }

    try {
      const { data: outfit, error: outfitError } = await supabase
        .from("outfits")
        .insert([
          { 
            name: "Mon ensemble",
            is_favorite: true 
          }
        ])
        .select()
        .single();

      if (outfitError) throw outfitError;

      const { error: clothesError } = await supabase
        .from("outfit_clothes")
        .insert([
          { outfit_id: outfit.id, clothes_id: selectedTop },
          { outfit_id: outfit.id, clothes_id: selectedBottom },
          { outfit_id: outfit.id, clothes_id: selectedShoes }
        ]);

      if (clothesError) throw clothesError;

      toast.success("Ensemble enregistré dans vos favoris !");
    } catch (error) {
      console.error("Error saving outfit:", error);
      toast.error("Erreur lors de l'enregistrement de l'ensemble");
    }
  };

  return (
    <Button
      onClick={saveOutfit}
      className="gap-2"
      variant="outline"
    >
      <Star className="w-4 h-4" />
      Enregistrer en favori
    </Button>
  );
};