import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDropboxUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      console.log("Starting file upload to Dropbox:", file.name);

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-to-dropbox', {
        body: formData,
      });

      if (error) {
        console.error("Error uploading to Dropbox:", error);
        throw error;
      }

      console.log("File uploaded successfully:", data);
      toast.success('Fichier téléchargé avec succès sur Dropbox');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Store the file URL in Supabase
      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          filename: file.name,
          file_path: data.url,
          content_type: file.type,
          size: file.size,
          description: 'Uploaded to Dropbox',
          user_id: user.id
        });

      if (dbError) {
        console.error("Error storing file metadata:", dbError);
        throw dbError;
      }

      return data.url;
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