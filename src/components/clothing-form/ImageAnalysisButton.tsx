import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { useState } from "react";

interface ImageAnalysisButtonProps {
  form: UseFormReturn<FormValues>;
  previewUrl: string;
  isUploading: boolean;
}

export const ImageAnalysisButton = ({ form, previewUrl, isUploading }: ImageAnalysisButtonProps) => {
  const { analyzeUploadedImage } = useImageAnalysis(form);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeUploadedImage(previewUrl);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleAnalysis}
      disabled={isUploading || !previewUrl || isAnalyzing}
    >
      <Wand2 className="mr-2 h-4 w-4" />
      {isAnalyzing ? "Analyse en cours..." : "Analyser l'image"}
    </Button>
  );
};