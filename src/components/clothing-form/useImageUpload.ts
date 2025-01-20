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
      console.log("Début du processus d'upload pour:", file.name);

      const isValid = await validateImageFile(file);
      if (!isValid) {
        setUploadError("Format d'image invalide ou taille trop importante");
        toast.error("Format d'image invalide ou taille trop importante");
        return null;
      }

      const optimizedFile = await optimizeImage(file);
      console.log("Image optimisée:", {
        tailleOriginale: file.size,
        tailleOptimisée: optimizedFile.size
      });

      const publicUrl = await uploadImageToSupabase(optimizedFile);
      if (!publicUrl) {
        setUploadError("Erreur lors du téléchargement de l'image");
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      setPreviewUrl(publicUrl);
      toast.success("Image téléchargée avec succès");
      return publicUrl;
    } catch (error) {
      console.error("Erreur inattendue lors de l'upload:", error);
      setUploadError("Erreur lors du téléchargement de l'image");
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetPreview = useCallback(() => {
    setPreviewUrl(null);
    setUploadError(null);
  }, []);

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleImageUpload,
    resetPreview,
  };
};