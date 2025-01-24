import { FormValues } from "@/types/clothing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useClothingFormSubmit = (mode: 'create' | 'edit', existingClothingId?: number) => {
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues) => {
    try {
      if (!values.name || !values.category || !values.color) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const clothingData = {
        name: values.name,
        category: values.category,
        subcategory: values.subcategory,
        brand: values.brand,
        color: values.color,
        secondary_color: values.secondary_color,
        size: values.size,
        material: values.material,
        notes: values.notes,
        image: values.image,
        is_for_sale: values.is_for_sale,
        purchase_price: values.purchase_price,
        selling_price: values.selling_price,
        location: values.location,
      };

      if (mode === 'edit' && existingClothingId) {
        const { error } = await supabase
          .from('clothes')
          .update(clothingData)
          .eq('id', existingClothingId);

        if (error) throw error;
        toast.success("Vêtement modifié avec succès");
      } else {
        const { error } = await supabase
          .from('clothes')
          .insert(clothingData);

        if (error) throw error;
        toast.success("Vêtement ajouté avec succès");
      }

      navigate('/closet');
    } catch (error) {
      console.error('Error saving clothing:', error);
      toast.error("Erreur lors de l'enregistrement du vêtement");
    }
  };

  return { handleSubmit };
};