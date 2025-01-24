import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { BasicFields } from "./fields/BasicFields";
import { CategoryFields } from "./fields/CategoryFields";
import { ColorFields } from "./fields/ColorFields";
import { DetailsFields } from "./fields/DetailsFields";
import { ImageAnalysisButton } from "./ImageAnalysisButton";

interface ClothingFormFieldsProps {
  form: UseFormReturn<FormValues>;
  step: "basic" | "colors" | "details";
  previewUrl: string | null;
  isUploading: boolean;
}

export const ClothingFormFields = ({ form, step, previewUrl, isUploading }: ClothingFormFieldsProps) => {
  switch (step) {
    case "basic":
      return (
        <>
          <BasicFields form={form} />
          {previewUrl && (
            <ImageAnalysisButton 
              form={form} 
              previewUrl={previewUrl} 
              isUploading={isUploading} 
            />
          )}
          <CategoryFields form={form} />
        </>
      );
    case "colors":
      return <ColorFields form={form} />;
    case "details":
      return <DetailsFields form={form} />;
    default:
      return null;
  }
};