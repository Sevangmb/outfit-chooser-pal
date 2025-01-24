import { useForm } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { FormContainer } from "./clothing-form/FormContainer";
import { ImageSection } from "./clothing-form/ImageSection";
import { FieldsSection } from "./clothing-form/FieldsSection";
import { FormValues } from "@/types/clothing";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    },
  });
  
  const { isUploading, previewUrl, uploadError, handleImageUpload, resetPreview } = useImageUpload();

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });

      const capture = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png");
        form.setValue("image", imageData);
        stream.getTracks().forEach(track => track.stop());
      };

      video.addEventListener("click", capture);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleDelete = async () => {
    if (!existingClothing?.id) return;

    try {
      const { error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', existingClothing.id);

      if (error) throw error;

      toast.success("Vêtement supprimé avec succès");
      navigate('/closet');
    } catch (error) {
      console.error('Error deleting clothing:', error);
      toast.error("Erreur lors de la suppression du vêtement");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (!values.name || !values.category || !values.color) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      const clothingData = {
        name: values.name,
        category: values.category,
        subcategory: values.subcategory,
        brand: values.brand,
        color: values.color,
        secondary_color: values.secondary_color,
        size: values.size,
        material: values.material,
        notes: values.notes,
        image: values.image,
        is_for_sale: values.is_for_sale,
        purchase_price: values.purchase_price,
        selling_price: values.selling_price,
        location: values.location,
      };

      if (mode === 'edit' && existingClothing?.id) {
        const { error } = await supabase
          .from('clothes')
          .update(clothingData)
          .eq('id', existingClothing.id);

        if (error) throw error;
        toast.success("Vêtement modifié avec succès");
      } else {
        const { error } = await supabase
          .from('clothes')
          .insert(clothingData);

        if (error) throw error;
        toast.success("Vêtement ajouté avec succès");
      }

      if (onSuccess) {
        onSuccess();
      }
      navigate('/closet');
    } catch (error) {
      console.error('Error saving clothing:', error);
      toast.error("Erreur lors de l'enregistrement du vêtement");
    }
  };

  useEffect(() => {
    if (mode === 'edit' && !existingClothing) {
      navigate('/closet');
    }
  }, [mode, existingClothing, navigate]);

  return (
    <FormContainer
      form={form}
      onSubmit={handleSubmit}
      isValid={form.formState.isValid}
      isSubmitting={form.formState.isSubmitting}
      errors={form.formState.errors}
    >
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {mode === 'edit' ? 'Modifier le vêtement' : 'Ajouter un vêtement'}
          </h2>
          {mode === 'edit' && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ImageSection
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onResetPreview={resetPreview}
          uploadError={uploadError}
        />
        <FieldsSection form={form} />
      </div>
    </FormContainer>
  );
};