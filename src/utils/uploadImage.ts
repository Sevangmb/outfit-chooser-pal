import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (imageUrl: string, bucket: string = 'clothes'): Promise<string | null> => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const fileExt = imageUrl.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

    console.log("Uploading image to Supabase:", fileName);

    // Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log("Image uploaded successfully:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
};