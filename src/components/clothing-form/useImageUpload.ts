import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Téléchargement de l'image en cours...");
      
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

      // Prepare file for upload
      const fileExt = file.name.split('.').pop();
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
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
        return null;
      }

      console.log("File uploaded successfully:", data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(safeFileName);

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
    if (previewUrl?.startsWith('blob:')) {
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