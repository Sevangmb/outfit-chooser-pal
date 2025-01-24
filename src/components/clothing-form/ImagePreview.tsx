import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useImageAnalysis } from "./hooks/useImageAnalysis";
import { useState } from "react";

interface ImagePreviewProps {
  form: UseFormReturn<FormValues>;
  previewUrl: string | null;
  isUploading: boolean;
  onError: () => void;
  onLoad: () => void;
}

export const ImagePreview = ({ 
  form, 
  previewUrl, 
  isUploading,
  onError,
  onLoad
}: ImagePreviewProps) => {
  const { analyzeUploadedImage } = useImageAnalysis(form);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Error loading image:", previewUrl);
    setImageError(true);
    onError();
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", previewUrl);
    setImageError(false);
    onLoad();
  };

  if (!previewUrl || imageError) return null;

  return (
    <div className="space-y-4">
      <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
        <img
          src={previewUrl}
          alt="Aperçu"
          className="h-full w-full object-contain"
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="eager"
          decoding="sync"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => analyzeUploadedImage(previewUrl)}
        disabled={isUploading}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        Analyser l'image
      </Button>
    </div>
  );
};