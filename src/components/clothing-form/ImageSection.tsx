import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { ImageUploadTabs } from "./ImageUploadTabs";
import { ImageAnalysisButton } from "./ImageAnalysisButton";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onResetPreview: () => void;
}

export const ImageSection = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onFileUpload,
  onCameraCapture,
  onResetPreview
}: ImageSectionProps) => {
  const handleUrlUpload = async (url: string) => {
    form.setValue("image", url, { shouldValidate: true });
  };

  return (
    <div className="space-y-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6">
      <ImageUploadTabs
        form={form}
        isUploading={isUploading}
        previewUrl={previewUrl}
        uploadError={uploadError}
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