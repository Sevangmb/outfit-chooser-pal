import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Generate a timestamp-based filename to avoid collisions
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExt}`;
    
    console.log("Generated filename:", fileName);

    // Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful, getting public URL");
    
    // Get the public URL
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("Error getting public URL:", urlError);
      throw urlError;
    }

    console.log("Successfully generated public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};