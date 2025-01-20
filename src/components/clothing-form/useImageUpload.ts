import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const verifyImageUrl = async (url: string): Promise<boolean> => {
    try {
      console.log("Verifying image URL:", url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

      const response = await fetch(url, {
        signal: controller.signal,
        method: 'HEAD' // Only fetch headers, not the full image
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Image not accessible: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("URL does not point to a valid image");
      }

      return true;
    } catch (error) {
      console.error("Error verifying image URL:", error);
      return false;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      toast.info("Téléchargement de l'image en cours...");
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Le fichier doit être une image");
        return null;
      }

      // Validate file size (5MB max)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return null;
      }
      
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

      // Verify the uploaded image is accessible with timeout
      const isValid = await verifyImageUrl(publicUrl);
      if (!isValid) {
        throw new Error("Uploaded image is not accessible");
      }

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
    verifyImageUrl,
  };
};