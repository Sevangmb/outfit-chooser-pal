import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    // First read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Create a blob with explicit image MIME type
    const blob = new Blob([arrayBuffer], { type: file.type });
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

    console.log("Starting upload for file:", fileName, "type:", file.type, "size:", file.size);

    // Upload the blob directly
    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, blob, {
        cacheControl: '3600',
        contentType: file.type,
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