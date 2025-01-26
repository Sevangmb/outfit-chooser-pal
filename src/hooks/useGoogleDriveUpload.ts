import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGoogleDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const { data: { publicUrl }, error } = await supabase.functions.invoke('upload-to-drive', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      toast.success('Fichier téléchargé avec succès sur Google Drive');
      return publicUrl;

    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    uploadFile,
  };
};