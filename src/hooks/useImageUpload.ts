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
        throw new Error('Format de fichier invalide. Seules les images sont autorisées.');
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Direct upload to Supabase without background removal
      const imageUrl = await uploadImageToSupabase(file);
      console.log("Upload successful, URL:", imageUrl);
      
      toast.success("Image téléchargée avec succès");
      return imageUrl;
    } catch (error) {
      console.error("Error during image upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image";
      setUploadError(errorMessage);
      setPreviewUrl(null);
      toast.error(errorMessage);
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