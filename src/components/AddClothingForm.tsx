import { Form } from "@/components/ui/form";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { ImageAnalysisButton } from "./clothing-form/ImageAnalysisButton";
import { SubmitButton } from "./clothing-form/SubmitButton";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    try {
      console.log("Form submitted with values:", values);
      toast.success(`Le vêtement "${values.name}" a été ajouté à votre garde-robe`);
      
      // Attendre un peu pour que l'utilisateur voie le message de succès
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers la garde-robe
      navigate("/closet");
      onSuccess?.();
    } catch (error) {
      console.error("Error in form success callback:", error);
      toast.error("Une erreur est survenue lors de l'ajout du vêtement");
    }
  });
  
  const { isUploading, previewUrl, handleImageUpload, resetPreview } = useImageUpload();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  const getRequiredFieldsErrors = () => {
    const requiredFields = {
      name: "le nom",
      category: "la catégorie",
      color: "la couleur",
      image: "l'image"
    };
    
    return Object.entries(errors)
      .filter(([key]) => key in requiredFields)
      .map(([key]) => requiredFields[key as keyof typeof requiredFields]);
  };

  const missingFields = getRequiredFieldsErrors();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {missingFields.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Champs requis manquants : {missingFields.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <ImageUploadTabs
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onUrlUpload={handleUrlImage}
        />

        <ImageAnalysisButton
          form={form}
          previewUrl={previewUrl}
          isUploading={isUploading}
        />

        <ClothingFormFields form={form} />

        <SubmitButton 
          isUploading={isUploading} 
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      </form>
    </Form>
  );
};