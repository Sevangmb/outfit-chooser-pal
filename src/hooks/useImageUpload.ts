import { useState } from "react";
import { uploadImageToSupabase } from "@/services/imageUploadService";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    console.log("Starting image upload:", file.name);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const publicUrl = await uploadImageToSupabase(file);
      console.log("Upload successful, public URL:", publicUrl);
      
      if (!publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
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