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
      
      // Analyze image for category, name, and subcategory
      const analysis = await analyzeImage(previewUrl);
      
      if (analysis?.category) {
        console.log("Setting detected category:", analysis.category);
        form.setValue("category", analysis.category, { shouldValidate: true });
        toast.success(`Catégorie détectée : ${analysis.category}`);
      }
      
      if (analysis?.name) {
        console.log("Setting detected name:", analysis.name);
        form.setValue("name", analysis.name, { shouldValidate: true });
        toast.success(`Nom détecté : ${analysis.name}`);
      }

      if (analysis?.subcategory) {
        console.log("Setting detected subcategory:", analysis.subcategory);
        form.setValue("subcategory", analysis.subcategory, { shouldValidate: true });
        toast.success(`Sous-catégorie détectée : ${analysis.subcategory}`);
      }

      // Extract dominant color
      const dominantColor = await extractDominantColor(previewUrl);
      if (dominantColor && dominantColor !== '#000000') {
        console.log('Setting detected color:', dominantColor);
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