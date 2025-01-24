import { supabase } from "@/integrations/supabase/client";
import Resizer from "react-image-file-resizer";

const resizeFile = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      800, // max width
      800, // max height
      "JPEG",
      80, // quality
      0, // rotation
      (uri) => {
        if (uri instanceof Blob) {
          resolve(uri);
        } else {
          // If it's a base64 string, convert it to Blob
          fetch(uri as string)
            .then(res => res.blob())
            .then(blob => resolve(blob));
        }
      },
      "blob"
    );
  });
};

export const uploadImageToSupabase = async (file: File): Promise<string> => {
  console.log("Starting image upload to Supabase:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });

  try {
    // Resize and optimize the image before upload
    const optimizedBlob = await resizeFile(file);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('clothes')
      .upload(filePath, optimizedBlob, {
        contentType: 'image/jpeg',
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

    const { data: { publicUrl } } = supabase.storage
      .from('clothes')
      .getPublicUrl(data.path);

    console.log("Image URL generated:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
};