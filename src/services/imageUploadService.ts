import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Generate a unique filename using timestamp and random number
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    
    // Upload the original file directly without any transformation
    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      throw error;
    }

    console.log("Upload successful, getting public URL");
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    console.log("Public URL generated:", publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error("Upload service error:", error);
    throw error;
  }
};