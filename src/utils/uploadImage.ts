import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    // First create a blob from the file
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    
    // Then create a new File with the correct MIME type
    const newFile = new File([blob], file.name, { type: file.type });
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

    console.log("Starting upload for file:", fileName, "with type:", newFile.type);

    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, newFile, {
        cacheControl: '3600',
        contentType: newFile.type,
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    console.log("Upload successful, public URL:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};