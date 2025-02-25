
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { ImageUploadTabs } from "./ImageUploadTabs";
import { ImageAnalysisButton } from "./ImageAnalysisButton";
import { StorageUsage } from "./StorageUsage";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  uploadProgress: number;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onResetPreview: () => void;
}

export const ImageSection = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  uploadProgress,
  onFileUpload,
  onCameraCapture,
  onResetPreview
}: ImageSectionProps) => {
  const handleUrlUpload = async (url: string) => {
    try {
      form.setValue("image", url);
      await form.trigger("image");
    } catch (error) {
      console.error("Error setting image URL:", error);
    }
  };

  return (
    <div className="space-y-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6">
      <StorageUsage />
      
      <ImageUploadTabs
        form={form}
        isUploading={isUploading}
        previewUrl={previewUrl}
        uploadError={uploadError}
        uploadProgress={uploadProgress}
        onFileUpload={onFileUpload}
        onCameraCapture={onCameraCapture}
        onUrlUpload={handleUrlUpload}
        onResetPreview={onResetPreview}
      />

      {previewUrl && (
        <ImageAnalysisButton 
          form={form} 
          previewUrl={previewUrl} 
          isUploading={isUploading} 
        />
      )}
    </div>
  );
};
