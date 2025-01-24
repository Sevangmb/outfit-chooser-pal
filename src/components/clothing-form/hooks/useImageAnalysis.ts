import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { analyzeImage, extractDominantColor } from "@/utils/imageAnalysis";
import { toast } from "sonner";

export const useImageAnalysis = (form: UseFormReturn<FormValues>) => {
  const analyzeUploadedImage = async (previewUrl: string) => {
    if (!previewUrl) {
      toast.error("Veuillez d'abord télécharger une image");
      return;
    }

    try {
      toast.info("Analyse de l'image en cours...");
      
      // Analyze image for category
      const analysis = await analyzeImage(previewUrl);
      if (analysis?.category) {
        console.log("Setting category to:", analysis.category);
        form.setValue("category", analysis.category, { shouldValidate: true });
        toast.success(`Catégorie détectée : ${analysis.category}`);
      }

      // Extract dominant color
      const dominantColor = await extractDominantColor(previewUrl);
      if (dominantColor && dominantColor !== '#000000') {
        console.log('Setting color to:', dominantColor);
        form.setValue("color", dominantColor, { shouldValidate: true });
        toast.success(`Couleur principale détectée`);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    }
  };

  return { analyzeUploadedImage };
};