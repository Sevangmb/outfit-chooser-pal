import { useState } from "react";
import { uploadImageToSupabase } from "@/services/imageUploadService";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    console.log("Starting image upload process:", file.name);
    setIsUploading(true);
    setUploadError(null);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // Create a preview URL for the image
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload the original file to Supabase
      const imageUrl = await uploadImageToSupabase(file);
      console.log("Upload successful, URL:", imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error("Error during image upload:", error);
      setUploadError(error instanceof Error ? error.message : "Error uploading image");
      setPreviewUrl(null);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadError(null);
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleImageUpload,
    resetPreview
  };
};