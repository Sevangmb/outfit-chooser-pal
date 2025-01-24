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
  onUrlUpload: (url: string) => Promise<void>;
}

export const ImageSection = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onFileUpload,
  onCameraCapture,
  onUrlUpload
}: ImageSectionProps) => {
  return (
    <div className="space-y-4">
      <ImageUploadTabs
        form={form}
        isUploading={isUploading}
        previewUrl={previewUrl}
        uploadError={uploadError}
        onFileUpload={onFileUpload}
        onCameraCapture={onCameraCapture}
        onUrlUpload={onUrlUpload}
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