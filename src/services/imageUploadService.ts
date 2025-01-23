import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Uploading to Supabase:", file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, file);

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    if (!data) {
      console.error("No data returned from Supabase");
      return null;
    }

    console.log("Upload successful:", data);

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(data.path);

    console.log("Public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};