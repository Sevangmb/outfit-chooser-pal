import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const verifyImageUrl = async (url: string): Promise<boolean> => {
    try {
      console.log("Verifying image URL:", url);
      
      // Pour les URLs blob, on les considère valides car créées localement
      if (url.startsWith('blob:')) {
        console.log("URL blob détectée, considérée comme valide");
        return true;
      }

      // Pour les URLs Supabase Storage, on les considère valides
      if (url.includes('supabase.co/storage')) {
        console.log("URL Supabase Storage détectée, considérée comme valide");
        return true;
      }

      // Pour les autres URLs, on vérifie le format
      try {
        new URL(url);
      } catch (e) {
        console.error("Format d'URL invalide:", e);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'URL:", error);
      return false;
    }
  };

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file:", filePath);
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('clothes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        toast.error("Erreur lors du téléchargement de l'image");
        return null;
      }

      console.log("File uploaded successfully:", data);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(filePath);

      // Clean up the local preview URL
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