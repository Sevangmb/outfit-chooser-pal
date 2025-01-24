import { supabase } from "@/integrations/supabase/client";

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

    // Get the public URL using the createSignedUrl method
    const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
      .from('clothes')
      .createSignedUrl(fileName, 31536000); // 1 year expiry

    if (signedUrlError) {
      console.error("Error getting signed URL:", signedUrlError);
      throw signedUrlError;
    }

    // Verify the URL is accessible
    try {
      const response = await fetch(signedUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error("Generated URL is not accessible:", signedUrl, response.status);
        throw new Error('Generated URL is not accessible');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        console.error("Invalid content type for image:", contentType);
        throw new Error('Invalid content type for uploaded image');
      }
      
      console.log("Successfully verified URL accessibility:", signedUrl);
    } catch (error) {
      console.error("Error verifying URL accessibility:", error);
      throw error;
    }

    return signedUrl;

  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};