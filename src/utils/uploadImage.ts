import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload process:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      throw new Error("Invalid file type. Only JPEG, PNG, GIF and WEBP are supported.");
    }

    // Create a blob from the file with the correct MIME type
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

    console.log("Uploading image with filename:", fileName);

    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, blob, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    // Get the public URL
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