import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOneDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      console.log("Starting file upload to OneDrive:", file.name);

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-to-onedrive', {
        body: formData,
      });

      if (error) {
        console.error("Error uploading to OneDrive:", error);
        throw error;
      }

      console.log("File uploaded successfully:", data);
      toast.success('Fichier téléchargé avec succès sur OneDrive');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Store the file URL in Supabase
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          filename: file.name,
          file_path: data.webUrl,
          content_type: file.type,
          size: file.size,
          description: 'Uploaded to OneDrive',
          user_id: user.id
        });

      if (dbError) {
        console.error("Error storing file metadata:", dbError);
        throw dbError;
      }

      return data.webUrl;
    } catch (error) {
      console.error('Error in upload process:', error);
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