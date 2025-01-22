import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Début de l'upload vers Supabase:", file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }

    if (!data) {
      console.error("Pas de données retournées par Supabase");
      return null;
    }

    console.log("Upload réussi:", data);

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(data.path);

    return publicUrl;

  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
};