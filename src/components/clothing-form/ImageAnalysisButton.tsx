import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { analyzeImage, extractDominantColor } from "@/utils/imageAnalysis";
import { toast } from "sonner";

interface ImageAnalysisButtonProps {
  form: UseFormReturn<FormValues>;
  previewUrl: string | null;
  isUploading: boolean;
}

export const ImageAnalysisButton = ({ form, previewUrl, isUploading }: ImageAnalysisButtonProps) => {
  const analyzeUploadedImage = async () => {
    if (!previewUrl) {
      toast.error("Veuillez d'abord télécharger une image");
      return;
    }

    try {
      toast.info("Analyse de l'image en cours...");
      
      // Analyze image for category
      const analysis = await analyzeImage(previewUrl);
      if (analysis?.category) {
        form.setValue("category", analysis.category);
        toast.success(`Catégorie détectée : ${analysis.category}`);
      }

      // Extract dominant color
      const dominantColor = await extractDominantColor(previewUrl);
      if (dominantColor && dominantColor !== '#000000') {
        console.log('Setting color to:', dominantColor);
        form.setValue("color", dominantColor, { shouldValidate: true });
        toast.success("Couleur principale détectée");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    }
  };

  if (!previewUrl) return null;

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={analyzeUploadedImage}
      disabled={isUploading}
    >
      <Wand2 className="mr-2 h-4 w-4" />
      Analyser l'image
    </Button>
  );
};