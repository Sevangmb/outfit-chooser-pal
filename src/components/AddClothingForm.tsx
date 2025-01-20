import { Form } from "@/components/ui/form";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { ImageAnalysisButton } from "./clothing-form/ImageAnalysisButton";
import { SubmitButton } from "./clothing-form/SubmitButton";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WizardNavigation } from "./clothing-form/WizardNavigation";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

const STEPS = [
  {
    title: "Image",
    isComplete: (values: any) => !!values.image && !values.image.startsWith('blob:'),
  },
  {
    title: "Informations de base",
    isComplete: (values: any) => !!values.name && !!values.category,
  },
  {
    title: "Couleurs",
    isComplete: (values: any) => !!values.color,
  },
  {
    title: "Détails additionnels",
    isComplete: () => true, // Optional step
  },
];

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    try {
      console.log("Form submitted with values:", values);
      
      if (!values.image || values.image.startsWith('blob:')) {
        toast.error("L'image n'a pas été téléchargée correctement");
        return;
      }

      toast.success(`Le vêtement "${values.name}" a été ajouté à votre garde-robe`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/closet");
      onSuccess?.();
    } catch (error) {
      console.error("Error in form success callback:", error);
      toast.error("Une erreur est survenue lors de l'ajout du vêtement");
    }
  });
  
  const { isUploading, previewUrl, uploadError, handleImageUpload, resetPreview } = useImageUpload();

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

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Impossible de créer le contexte canvas");
      }
      
      context.drawImage(video, 0, 0);
      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
      );
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const imageUrl = await handleImageUpload(file);
      
      if (imageUrl) {
        form.setValue("image", imageUrl, { shouldValidate: true });
        toast.success("Image capturée avec succès");
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Erreur lors de la capture de l'image");
    }
  };

  const handleUrlImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error("Le fichier n'est pas une image valide");
      }
      
      const file = new File([blob], "url-image.jpg", { type: blob.type });
      const imageUrl = await handleImageUpload(file);
      
      if (imageUrl) {
        form.setValue("image", imageUrl, { shouldValidate: true });
        form.setValue("imageUrl", "");
        toast.success("Image téléchargée avec succès");
      }
    } catch (error) {
      console.error("Error downloading image from URL:", error);
      toast.error("Erreur lors du téléchargement de l'image depuis l'URL");
    }
  };

  const handleNext = () => {
    const currentStepData = STEPS[currentStep];
    if (currentStepData.isComplete(form.getValues())) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast.error("Veuillez remplir tous les champs requis avant de continuer");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <ImageUploadTabs
              form={form}
              isUploading={isUploading}
              previewUrl={previewUrl}
              uploadError={uploadError}
              onFileUpload={handleImageUpload}
              onCameraCapture={handleCameraCapture}
              onUrlUpload={handleUrlImage}
            />
            <ImageAnalysisButton
              form={form}
              previewUrl={previewUrl}
              isUploading={isUploading}
            />
          </>
        );
      case 1:
        return <ClothingFormFields form={form} step="basic" />;
      case 2:
        return <ClothingFormFields form={form} step="colors" />;
      case 3:
        return <ClothingFormFields form={form} step="details" />;
      default:
        return null;
    }
  };

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

        <div className="space-y-4">
          {renderStepContent()}
        </div>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onNext={currentStep === STEPS.length - 1 ? form.handleSubmit(onSubmit) : handleNext}
          onPrevious={handlePrevious}
          isNextDisabled={currentStep === STEPS.length - 1 ? isSubmitting || !isValid : false}
        />
      </form>
    </Form>
  );
};