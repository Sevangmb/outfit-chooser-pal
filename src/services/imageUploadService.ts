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

  // Generate a unique filename using UUID
  const fileExt = file.type.split('/')[1];
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  console.log("Generated unique filename:", fileName);

  try {
    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
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