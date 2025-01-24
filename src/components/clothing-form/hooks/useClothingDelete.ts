import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useClothingDelete = () => {
  const navigate = useNavigate();

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Vêtement supprimé avec succès");
      navigate('/closet');
    } catch (error) {
      console.error('Error deleting clothing:', error);
      toast.error("Erreur lors de la suppression du vêtement");
    }
  };

  return { handleDelete };
};