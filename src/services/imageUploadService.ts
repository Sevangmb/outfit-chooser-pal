import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Uploading file to Supabase storage:", file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Ajout explicite du type de contenu
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return null;
    }

    console.log("File uploaded successfully:", data);

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    // Vérifier que l'URL est bien générée
    if (!publicUrl) {
      console.error("Failed to generate public URL");
      return null;
    }

    console.log("Generated public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
};