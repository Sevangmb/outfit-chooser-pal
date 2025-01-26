import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { analyzeImage, extractDominantColor } from "@/utils/imageAnalysis";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useImageAnalysis = (form: UseFormReturn<FormValues>) => {
  const analyzeLabelText = async (imageUrl: string) => {
    try {
      console.log("Starting label analysis for:", imageUrl);
      
      // Convert image URL to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke('analyze-label', {
        body: { imageBase64: base64 }
      });

      if (error) {
        console.error("Label analysis error:", error);
        throw error;
      }

      console.log("Label analysis results:", data);

      if (data.brand) {
        console.log("Setting detected brand:", data.brand);
        form.setValue("brand", data.brand, { shouldValidate: true });
        toast.success(`Marque détectée : ${data.brand}`);
      }

      if (data.size) {
        console.log("Setting detected size:", data.size);
        form.setValue("size", data.size, { shouldValidate: true });
        toast.success(`Taille détectée : ${data.size}`);
      }

      if (data.material) {
        console.log("Setting detected material:", data.material);
        form.setValue("material", data.material, { shouldValidate: true });
        toast.success(`Matière détectée : ${data.material}`);
      }

    } catch (error) {
      console.error("Error analyzing label:", error);
      toast.error("Erreur lors de l'analyse de l'étiquette");
    }
  };

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

      // Analyze label text
      await analyzeLabelText(previewUrl);

    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    }
  };

  return { analyzeUploadedImage };
};