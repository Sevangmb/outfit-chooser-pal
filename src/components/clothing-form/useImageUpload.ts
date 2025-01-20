import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      toast.info("Téléchargement de l'image en cours...");
      
      // Create a local preview URL
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      toast.info("Aperçu de l'image généré");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file:", filePath);
      const { error: uploadError, data } = await supabase.storage
        .from('clothes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully:", data);
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(filePath);

      // Keep the local preview until we confirm the upload is successful
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(publicUrl);
      
      toast.success("Image téléchargée avec succès");
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return {
    isUploading,
    previewUrl,
    handleImageUpload,
    resetPreview,
  };
};