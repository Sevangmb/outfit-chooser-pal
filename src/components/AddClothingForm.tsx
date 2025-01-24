import { useForm } from "react-hook-form";
import { useImageUpload } from "@/hooks/useImageUpload";
import { FormContainer } from "./clothing-form/FormContainer";
import { ImageSection } from "./clothing-form/ImageSection";
import { FieldsSection } from "./clothing-form/FieldsSection";
import { FormValues } from "@/types/clothing";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      image: null,
      name: "",
      category: "",
      color: "",
      subcategory: "",
      brand: "",
      secondary_color: "",
      size: "",
      material: "",
      notes: "",
      imageUrl: "",
      is_for_sale: false,
      purchase_price: null,
      selling_price: null,
      location: null,
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

  return (
    <FormContainer
      form={form}
      onSuccess={onSuccess}
      isUploading={isUploading}
      uploadError={uploadError}
      errors={form.formState.errors}
    >
      <div className="space-y-8">
        <ImageSection
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onImageUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onResetPreview={resetPreview}
        />
        <FieldsSection form={form} />
      </div>
    </FormContainer>
  );
};