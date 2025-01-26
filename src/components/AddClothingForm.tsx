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
      name: existingClothing?.name || "",
      category: existingClothing?.category || "",
      color: existingClothing?.color || "",
      subcategory: existingClothing?.subcategory || "",
      brand: existingClothing?.brand || "",
      secondary_color: existingClothing?.secondary_color || "",
      size: existingClothing?.size || "",
      material: existingClothing?.material || "",
      notes: existingClothing?.notes || "",
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
  const { handleCameraCapture } = useCameraCapture((imageData: string) => {
    form.setValue("image", imageData);
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
            onFileUpload={handleFileUpload}
            onCameraCapture={handleCameraCapture}
            onResetPreview={resetPreview}
          />
          <FieldsSection form={form} />
        </div>
      </FormContainer>
    </div>
  );
};