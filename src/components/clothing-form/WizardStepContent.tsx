import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { ClothingFormFields } from "./ClothingFormFields";
import { ImageUploadTabs } from "./ImageUploadTabs";
import { ImageAnalysisButton } from "./ImageAnalysisButton";

interface WizardStepContentProps {
  currentStep: number;
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onImageUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
}

export const WizardStepContent = ({
  currentStep,
  form,
  isUploading,
  previewUrl,
  uploadError,
  onImageUpload,
  onCameraCapture,
  onUrlUpload,
}: WizardStepContentProps) => {
  switch (currentStep) {
    case 0:
      return (
        <>
          <ImageUploadTabs
            form={form}
            isUploading={isUploading}
            previewUrl={previewUrl}
            uploadError={uploadError}
            onFileUpload={onImageUpload}
            onCameraCapture={onCameraCapture}
            onUrlUpload={onUrlUpload}
          />
          <ImageAnalysisButton
            form={form}
            previewUrl={previewUrl}
            isUploading={isUploading}
          />
        </>
      );
    case 1:
      return <ClothingFormFields form={form} step="basic" />;
    case 2:
      return <ClothingFormFields form={form} step="colors" />;
    case 3:
      return <ClothingFormFields form={form} step="details" />;
    default:
      return null;
  }
};