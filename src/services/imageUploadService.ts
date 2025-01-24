import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string> => {
  console.log("Starting image upload to Supabase:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });

  if (!file.type.startsWith('image/')) {
    throw new Error(`Invalid file type: ${file.type}. Only images are allowed.`);
  }

  try {
    // Generate a unique filename with proper extension
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    if (!data) {
      console.error("No data returned from Supabase");
      throw new Error("Upload failed");
    }

    console.log("Upload successful:", data);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(data.path);

    // Verify the URL is accessible
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to verify uploaded image: ${response.status}`);
    }

    console.log("Image URL verified and accessible:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};