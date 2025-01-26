import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

    console.log("Starting upload for file:", fileName, "type:", file.type, "size:", file.size);

    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', file, fileName);

    // Upload file directly with explicit content type
    const { data, error } = await supabase.storage
      .from('clothes')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type, // Ensure we're using the file's actual MIME type
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