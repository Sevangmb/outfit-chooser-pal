import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      console.log("Démarrage de l'upload du fichier:", file.name);

      // Créer un FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload vers Google Drive via la fonction Edge
      console.log("Envoi vers Google Drive...");
      const { data, error } = await supabase.functions.invoke('upload-to-drive', {
        body: formData,
      });

      if (error) {
        console.error("Erreur lors de l'upload:", error);
        throw error;
      }

      console.log("Fichier uploadé avec succès:", data);
      
      // Créer une URL de prévisualisation locale
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      
      // Retourner l'URL Google Drive
      toast.success('Image téléchargée avec succès');
      setUploadProgress(100);
      
      return data.webViewLink;
    } catch (error) {
      console.error("Erreur d'upload:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement";
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
    }
    setPreviewUrl(null);
    setUploadError(null);
    setUploadProgress(0);
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    uploadProgress,
    handleFileUpload,
    resetPreview
  };
};