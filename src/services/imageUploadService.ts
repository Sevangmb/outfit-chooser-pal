import { supabase } from "@/integrations/supabase/client";
import { verifyImageUrl } from "@/utils/imageValidation";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting Supabase upload for:", file.name);
    
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const filePath = `${timestamp}-${randomString}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('clothes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return null;
    }

    console.log("File uploaded successfully:", data);
    
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(filePath);

    // Verify the uploaded image is accessible
    const isAccessible = await verifyImageUrl(publicUrl);
    if (!isAccessible) {
      console.error("Image verification failed");
      
      // Clean up failed upload
      await supabase.storage
        .from('clothes')
        .remove([filePath]);
      
      return null;
    }

    return publicUrl;
  } catch (error) {
    console.error("Unexpected error during upload:", error);
    return null;
  }
};