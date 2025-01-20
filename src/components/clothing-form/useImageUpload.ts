import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateImage = useCallback(async (file: File): Promise<boolean> => {
    console.log("Validating image:", file.name);
    
    if (!file.type.startsWith('image/')) {
      setUploadError("Le fichier doit être une image");
      toast.error("Le fichier doit être une image");
      return false;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("L'image ne doit pas dépasser 5MB");
      toast.error("L'image ne doit pas dépasser 5MB");
      return false;
    }

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
      setUploadError("Format d'image invalide");
      toast.error("Format d'image invalide");
      return false;
    }
  }, []);

  const verifyImageAccessibility = useCallback(async (url: string): Promise<boolean> => {
    console.log("Verifying image accessibility:", url);
    try {
      // Ensure the URL is properly formatted
      const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
      console.log("Cleaned URL:", cleanUrl);

      const response = await fetch(cleanUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('Not an image');
      }

      const objectUrl = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);
      
      return true;
    } catch (error) {
      console.error("Error verifying image accessibility:", error);
      return false;
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      console.log("Starting image upload process for:", file.name);

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
      const filePath = `${timestamp}-${randomString}.${fileExt}`;
      
      console.log("Uploading file to Supabase:", filePath);
      
      const { error: uploadError, data } = await supabase.storage
        .from('clothes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Clean up local preview
      URL.revokeObjectURL(localPreviewUrl);

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        setUploadError("Erreur lors du téléchargement");
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      console.log("File uploaded successfully:", data);
      
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(filePath);

      // Clean up the URL to ensure proper format
      const cleanPublicUrl = publicUrl.replace(/([^:]\/)\/+/g, "$1");
      console.log("Clean public URL:", cleanPublicUrl);

      // Verify the uploaded image is accessible with retries
      let isAccessible = false;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds between retries
      
      while (!isAccessible && retryCount < maxRetries) {
        console.log(`Verifying image accessibility (attempt ${retryCount + 1}/${maxRetries})`);
        isAccessible = await verifyImageAccessibility(cleanPublicUrl);
        if (!isAccessible && retryCount < maxRetries - 1) {
          console.log(`Waiting ${retryDelay}ms before next retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        retryCount++;
      }

      if (!isAccessible) {
        console.error("Image verification failed after retries");
        setUploadError("L'image téléchargée n'est pas accessible");
        toast.error("L'image téléchargée n'est pas accessible");
        
        // Try to delete the failed upload
        try {
          await supabase.storage
            .from('clothes')
            .remove([filePath]);
          console.log("Cleaned up failed upload");
        } catch (cleanupError) {
          console.error("Error cleaning up failed upload:", cleanupError);
        }
        
        return null;
      }

      setPreviewUrl(cleanPublicUrl);
      toast.success("Image téléchargée avec succès");
      return cleanPublicUrl;
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      setUploadError("Erreur inattendue lors du téléchargement");
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateImage, verifyImageAccessibility]);

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