import { useState } from "react";
import { uploadImageToSupabase } from "@/services/imageUploadService";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const convertToPng = async (file: File): Promise<File> => {
    console.log("Converting image to PNG:", file.name);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Could not convert to PNG"));
            return;
          }
          
          const convertedFile = new File(
            [blob], 
            file.name.replace(/\.[^/.]+$/, "") + ".png",
            { type: "image/png" }
          );
          resolve(convertedFile);
        }, "image/png");
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    console.log("Starting image upload process:", file.name);
    setIsUploading(true);
    setUploadError(null);

    try {
      // Convert the image to PNG
      const pngFile = await convertToPng(file);
      console.log("Image converted to PNG:", pngFile.name);

      // Create preview URL
      const preview = URL.createObjectURL(pngFile);
      setPreviewUrl(preview);

      // Upload to Supabase
      const imageUrl = await uploadImageToSupabase(pngFile);
      console.log("Upload successful, URL:", imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error("Error during image upload:", error);
      setUploadError(error instanceof Error ? error.message : "Error uploading image");
      setPreviewUrl(null);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadError(null);
  };

  return {
    isUploading,
    previewUrl,
    uploadError,
    handleImageUpload,
    resetPreview
  };
};