import { useState } from 'react';
import { toast } from 'sonner';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      console.log("Starting file upload:", file.name);

      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file);
      console.log("Generated local URL:", localUrl);
      
      setPreviewUrl(localUrl);
      toast.success('Image téléchargée avec succès');
      
      return localUrl;
    } catch (error) {
      console.error("Upload error:", error);
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
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleFileUpload,
    resetPreview
  };
};