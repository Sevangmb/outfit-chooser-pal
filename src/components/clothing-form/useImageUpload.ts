import { useState } from "react";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/imageValidation";
import { uploadImageToSupabase } from "@/services/imageUploadService";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    console.log("Début de l'upload de l'image:", file.name);

    try {
      const isValid = await validateImageFile(file);
      if (!isValid) {
        toast.error("Format d'image invalide. Utilisez JPG, PNG, GIF ou WEBP.");
        return null;
      }

      // Upload direct sans optimisation
      const publicUrl = await uploadImageToSupabase(file);
      console.log("URL publique reçue:", publicUrl);
      
      if (!publicUrl) {
        throw new Error("Échec de l'upload de l'image");
      }

      toast.success("Image téléchargée avec succès");
      return publicUrl;

    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      
      // Message d'erreur spécifique pour le rejet par l'utilisateur
      if (error instanceof Error && error.message.includes("rejected")) {
        toast.error("Upload annulé par l'utilisateur");
      } else {
        toast.error("Erreur lors de l'upload de l'image");
      }
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading
  };
};