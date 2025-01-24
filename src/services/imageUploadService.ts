import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Generate a unique filename using timestamp and UUID
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${uuid}.${fileExt}`;
    
    console.log("Generated filename:", fileName);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful, getting public URL");
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    // Verify the URL is accessible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error("Generated URL is not accessible:", publicUrl);
        throw new Error('Generated URL is not accessible');
      }
    } catch (error) {
      console.error("Error verifying URL accessibility:", error);
      throw error;
    }

    console.log("Successfully generated public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};