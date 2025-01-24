import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);

      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file format. Only images are allowed.');
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      console.log("Created preview URL:", preview);
      setPreviewUrl(preview);

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}_${crypto.randomUUID()}.${fileExt}`;

      console.log("Uploading file to Supabase:", fileName);

      // Upload to Supabase
      const { data, error: uploadError } = await supabase.storage
        .from('clothes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        setUploadError(uploadError.message);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName);

      console.log("File uploaded successfully:", publicUrl);
      toast.success('Image uploaded successfully');

      return publicUrl;
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading the image';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPreview = () => {
    setPreviewUrl(null);
    setUploadError(null);
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleFileUpload,
    resetPreview,
  };
};