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
      toast.info("Détection de la couleur principale...");
      const dominantColor = await extractDominantColor(previewUrl);
      if (dominantColor && dominantColor !== '#000000') {
        console.log('Setting color to:', dominantColor);
        form.setValue("color", dominantColor, { shouldValidate: true });
        
        // Convert hex to color name (simplified version)
        const colorName = getColorName(dominantColor);
        toast.success(`Couleur principale détectée : ${colorName}`);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    }
  };

  const getColorName = (hex: string): string => {
    // Simplified color mapping - you might want to expand this
    const colors: Record<string, string> = {
      '#FF0000': 'Rouge',
      '#00FF00': 'Vert',
      '#0000FF': 'Bleu',
      '#FFFF00': 'Jaune',
      '#FF00FF': 'Magenta',
      '#00FFFF': 'Cyan',
      '#000000': 'Noir',
      '#FFFFFF': 'Blanc',
      '#808080': 'Gris',
    };

    // Find the closest color (very basic implementation)
    let closestColor = 'Couleur inconnue';
    let minDistance = Number.MAX_VALUE;

    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    Object.entries(colors).forEach(([colorHex, colorName]) => {
      const r2 = parseInt(colorHex.slice(1, 3), 16);
      const g2 = parseInt(colorHex.slice(3, 5), 16);
      const b2 = parseInt(colorHex.slice(5, 7), 16);

      const distance = Math.sqrt(
        Math.pow(r - r2, 2) + Math.pow(g - g2, 2) + Math.pow(b - b2, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorName;
      }
    });

    return closestColor;
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