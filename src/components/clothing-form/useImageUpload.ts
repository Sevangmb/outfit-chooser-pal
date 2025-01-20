import { useState, useCallback } from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/imageValidation";
import { uploadImageToSupabase } from "@/services/imageUploadService";
import { optimizeImage } from "@/utils/imageOptimization";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      console.log("Starting image upload process for:", file.name);

      const isValid = await validateImageFile(file);
      if (!isValid) {
        setUploadError("Format d'image invalide ou taille trop importante");
        toast.error("Format d'image invalide ou taille trop importante");
        return null;
      }

      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);
      console.log("Image optimized:", {
        originalSize: file.size,
        optimizedSize: optimizedFile.size
      });

      // Create a local preview URL
      const localPreviewUrl = URL.createObjectURL(optimizedFile);
      setPreviewUrl(localPreviewUrl);

      const publicUrl = await uploadImageToSupabase(optimizedFile);
      
      // Clean up local preview
      URL.revokeObjectURL(localPreviewUrl);

      if (!publicUrl) {
        setUploadError("Erreur lors du téléchargement de l'image");
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      setPreviewUrl(publicUrl);
      toast.success("Image téléchargée avec succès");
      return publicUrl;
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      setUploadError("Erreur inattendue lors du téléchargement");
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetPreview = useCallback(() => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadError(null);
  }, [previewUrl]);

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleImageUpload,
    resetPreview,
  };
};