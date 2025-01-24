import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string> => {
  console.log("Uploading to Supabase:", file.name);
  
  // Garder l'extension d'origine du fichier
  const fileExt = file.name.split('.').pop() || file.type.split('/')[1];
  const fileName = `${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('clothes')
    .upload(fileName, file, {
      contentType: file.type, // Utiliser le type MIME d'origine
      upsert: false
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from Supabase");
    throw new Error("Upload failed");
  }

  console.log("Upload successful:", data);

  const { data: { publicUrl } } = supabase.storage
    .from('clothes')
    .getPublicUrl(data.path);

  console.log("Public URL:", publicUrl);
  return publicUrl;
};