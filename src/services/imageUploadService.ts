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

    // First check if the file already exists
    const { data: existingFile } = await supabase.storage
      .from('clothes')
      .list('', {
        search: fileName
      });

    if (existingFile && existingFile.length > 0) {
      console.error("File already exists:", fileName);
      throw new Error('File already exists');
    }

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