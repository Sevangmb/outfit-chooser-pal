import { supabase } from "@/integrations/supabase/client";

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    console.log("Starting image upload process:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Fichier trop volumineux. Maximum 5MB.');
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Create a new Blob with the correct MIME type
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Generate a unique filename with proper extension
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    const extension = file.type.split('/')[1] || 'jpg';
    const fileName = `${timestamp}_${crypto.randomUUID()}.${extension}`;

    console.log("Uploading image with filename:", fileName);
    console.log("File MIME type:", file.type);

    // Upload to Supabase storage with explicit content type
    const { data, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(fileName, blob, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(fileName);

    console.log("Image uploaded successfully:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};