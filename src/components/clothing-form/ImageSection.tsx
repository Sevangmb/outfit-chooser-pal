import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { ImageUpload } from "./ImageUpload";
import { ImageAnalysisButton } from "./ImageAnalysisButton";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
}

export const ImageSection = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onFileUpload,
  onCameraCapture
}: ImageSectionProps) => {
  return (
    <div className="space-y-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6">
      <ImageUpload
        form={form}
        isUploading={isUploading}
        previewUrl={previewUrl}
        uploadError={uploadError}
        onFileUpload={onFileUpload}
        onCameraCapture={onCameraCapture}
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