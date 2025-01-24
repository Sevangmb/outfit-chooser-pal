import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Created preview URL:", preview);
      setPreviewUrl(preview);

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

      console.log("Uploading file to Supabase:", fileName);

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('clothes')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName);

      console.log("Upload successful, public URL:", publicUrl);
      toast.success("Image téléchargée avec succès");
      return publicUrl;

    } catch (error) {
      console.error("Error during image upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image";
      setUploadError(errorMessage);
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