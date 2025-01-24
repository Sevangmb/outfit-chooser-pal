import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useImageAnalysis } from "./hooks/useImageAnalysis";

interface ImageAnalysisButtonProps {
  form: UseFormReturn<FormValues>;
  previewUrl: string;
  isUploading: boolean;
}

export const ImageAnalysisButton = ({ form, previewUrl, isUploading }: ImageAnalysisButtonProps) => {
  const { analyzeUploadedImage } = useImageAnalysis(form);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => analyzeUploadedImage(previewUrl)}
      disabled={isUploading || !previewUrl}
    >
      <Wand2 className="mr-2 h-4 w-4" />
      Analyser l'image
    </Button>
  );
};