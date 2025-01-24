import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload to Supabase:", file.name);
    
    // Generate a unique filename using timestamp and UUID
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const uuid = crypto.randomUUID();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${uuid}.${fileExt}`;
    
    console.log("Generated filename:", fileName);

    // Upload the file with proper content type
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

    // Get the public URL
    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("Error getting public URL:", urlError);
      throw urlError;
    }

    console.log("Successfully uploaded image, public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    toast.error("Erreur lors du téléchargement de l'image");
    throw error;
  }
};