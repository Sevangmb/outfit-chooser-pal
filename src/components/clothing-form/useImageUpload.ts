import { useState, useCallback } from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/imageValidation";
import { uploadImageToSupabase } from "@/services/imageUploadService";

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

      // Upload direct sans optimisation
      const publicUrl = await uploadImageToSupabase(file);
      console.log("URL publique reçue:", publicUrl);
      
      if (!publicUrl) {
        setUploadError("Erreur lors du téléchargement de l'image");
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      // Create a new URL object to validate the URL
      try {
        new URL(publicUrl);
      } catch (e) {
        console.error("URL invalide reçue:", publicUrl);
        setUploadError("URL de l'image invalide");
        toast.error("URL de l'image invalide");
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