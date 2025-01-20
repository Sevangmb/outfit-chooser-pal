import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Uploading file to Supabase storage:", file.name);
    
    // Récupérer l'ID de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    // Créer un chemin spécifique à l'utilisateur
    const filePath = `${user.id}/${fileName}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return null;
    }

    console.log("File uploaded successfully:", data);

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(filePath);

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