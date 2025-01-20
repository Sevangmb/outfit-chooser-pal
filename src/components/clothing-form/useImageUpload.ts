import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateImage = async (file: File): Promise<boolean> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Le fichier doit être une image");
      return false;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return false;
    }

    // Validate image dimensions and loading
    try {
      const imageUrl = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(imageUrl);
          resolve(true);
        };
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error("Format d'image invalide"));
        };
        img.src = imageUrl;
      });
      return true;
    } catch (error) {
      console.error("Error validating image:", error);
      toast.error("Format d'image invalide");
      return false;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      console.log("Téléchargement de l'image en cours...");

      // Validate image
      const isValid = await validateImage(file);
      if (!isValid) {
        return null;
      }

      // Create a local preview URL
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Prepare file for upload
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const safeFileName = `${timestamp}-${randomString}.${fileExt}`;
      
      console.log("Uploading file:", safeFileName);
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('clothes')
        .upload(safeFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Clean up local preview
      URL.revokeObjectURL(localPreviewUrl);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        toast.error("Erreur lors du téléchargement de l'image");
        setUploadError("Erreur lors du téléchargement");
        return null;
      }

      console.log("File uploaded successfully:", data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(safeFileName);

      // Verify the uploaded image is accessible
      try {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = publicUrl;
        });
      } catch (error) {
        console.error("Error verifying uploaded image:", error);
        toast.error("L'image téléchargée n'est pas accessible");
        return null;
      }

      setPreviewUrl(publicUrl);
      toast.success("Image téléchargée avec succès");
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      setUploadError("Erreur inattendue");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPreview = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadError(null);
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleImageUpload,
    resetPreview,
  };
};