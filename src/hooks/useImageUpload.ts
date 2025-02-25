
import { useState } from 'react';
import { toast } from 'sonner';
import { uploadImageToSupabase } from '@/utils/uploadImage';

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
      console.log("Starting file upload:", file.name);

      // Create a local preview
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setUploadProgress(30);

      // Upload to Supabase
      const publicUrl = await uploadImageToSupabase(file);
      
      if (!publicUrl) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      setUploadProgress(100);
      toast.success('Image téléchargée avec succès');
      setPreviewUrl(publicUrl); // Update preview with the actual URL
      
      return publicUrl;
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
    if (previewUrl && previewUrl.startsWith('blob:')) {
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
