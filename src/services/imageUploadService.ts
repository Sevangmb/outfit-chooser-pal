import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${uuid}.${fileExt}`;
    
    console.log("Generated filename:", fileName);

    // Upload with better quality settings
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '31536000', // Cache for 1 year
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    console.log("Successfully uploaded image, public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    toast.error("Erreur lors du téléchargement de l'image");
    throw error;
  }
};