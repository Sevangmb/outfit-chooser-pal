import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Générer un nom de fichier unique avec timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${uuid}.${fileExt}`;
    
    console.log("Generated filename:", fileName);

    // Upload avec des paramètres de qualité optimisés
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '31536000', // Cache pour 1 an
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    console.log("Successfully uploaded image, public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    toast.error("Erreur lors du téléchargement de l'image");
    throw error;
  }
};