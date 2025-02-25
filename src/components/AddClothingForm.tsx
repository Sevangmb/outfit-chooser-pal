
import { useForm } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { FormContainer } from "./clothing-form/FormContainer";
import { ImageSection } from "./clothing-form/ImageSection";
import { FieldsSection } from "./clothing-form/FieldsSection";
import { FormValues } from "@/types/clothing";
import { useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useClothingFormSubmit } from "./clothing-form/hooks/useClothingFormSubmit";
import { useClothingDelete } from "./clothing-form/hooks/useClothingDelete";
import { useCameraCapture } from "./clothing-form/hooks/useCameraCapture";
import { analyzeImage } from "@/utils/imageAnalysis";
import { toast } from "sonner";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const location = useLocation();
  const mode = location.state?.mode || 'create';
  const existingClothing = location.state?.clothing;

  const form = useForm<FormValues>({
    defaultValues: {
      image: existingClothing?.image || null,
      name: "Mon nouveau vêtement",
      category: existingClothing?.category || "",
      color: existingClothing?.color || "",
      subcategory: existingClothing?.subcategory || "",
      brand: existingClothing?.brand || "",
      secondary_color: existingClothing?.secondary_color || "",
      size: existingClothing?.size || "",
      material: existingClothing?.material || "",
      notes: "Description de mon vêtement",
      imageUrl: existingClothing?.image || "",
      is_for_sale: existingClothing?.is_for_sale || false,
      purchase_price: existingClothing?.purchase_price || null,
      selling_price: existingClothing?.selling_price || null,
      location: existingClothing?.location || null,
      purchase_date: existingClothing?.purchase_date ? new Date(existingClothing.purchase_date) : null,
      is_archived: existingClothing?.is_archived || false,
      needs_alterations: existingClothing?.needs_alterations || false,
      alteration_notes: existingClothing?.alteration_notes || null,
    },
  });

  const { isUploading, previewUrl, uploadError, uploadProgress, handleFileUpload, resetPreview } = useImageUpload();
  const { handleSubmit } = useClothingFormSubmit(mode, existingClothing?.id);
  const { handleDelete } = useClothingDelete();

  const handleImageUploadWithAnalysis = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        const analysis = await analyzeImage(imageUrl);
        if (analysis) {
          if (analysis.category) {
            form.setValue("category", analysis.category);
            toast.success(`Catégorie détectée : ${analysis.category}`);
          }
          if (analysis.subcategory) {
            form.setValue("subcategory", analysis.subcategory);
            toast.success(`Sous-catégorie détectée : ${analysis.subcategory}`);
          }
          if (analysis.name) {
            form.setValue("name", analysis.name);
            toast.success(`Nom détecté : ${analysis.name}`);
          }
        }
      }
      return imageUrl; // Return the URL to satisfy the type requirement
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
      return null;
    }
  };

  const { handleCameraCapture } = useCameraCapture(async (imageData: string) => {
    form.setValue("image", imageData);
    // Analyse de l'image capturée par la caméra
    if (imageData) {
      const analysis = await analyzeImage(imageData);
      if (analysis) {
        if (analysis.category) {
          form.setValue("category", analysis.category);
          toast.success(`Catégorie détectée : ${analysis.category}`);
        }
        if (analysis.subcategory) {
          form.setValue("subcategory", analysis.subcategory);
          toast.success(`Sous-catégorie détectée : ${analysis.subcategory}`);
        }
        if (analysis.name) {
          form.setValue("name", analysis.name);
          toast.success(`Nom détecté : ${analysis.name}`);
        }
      }
    }
  });

  return (
    <div className="py-4">
      <FormContainer
        form={form}
        onSubmit={handleSubmit}
        isValid={form.formState.isValid}
        isSubmitting={form.formState.isSubmitting}
        errors={form.formState.errors}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {mode === 'edit' ? 'Modifier le vêtement' : 'Ajouter un vêtement'}
            </h2>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => existingClothing?.id && handleDelete(existingClothing.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ImageSection
            form={form}
            isUploading={isUploading}
            previewUrl={previewUrl}
            uploadError={uploadError}
            uploadProgress={uploadProgress}
            onFileUpload={handleImageUploadWithAnalysis}
            onCameraCapture={handleCameraCapture}
            onResetPreview={resetPreview}
          />
          <FieldsSection form={form} />
        </div>
      </FormContainer>
    </div>
  );
};
