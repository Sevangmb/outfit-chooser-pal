import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { analyzeImage, extractDominantColor } from "@/utils/imageAnalysis";

export const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().min(2, "La catégorie est requise"),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().min(2, "La couleur principale est requise"),
  secondary_color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  notes: z.string().optional(),
  image: z.string().nullable().optional(),
  imageUrl: z.string().url().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const queryClient = useQueryClient();
  const { isUploading, previewUrl, handleImageUpload, resetPreview } = useImageUpload();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      subcategory: "",
      brand: "",
      color: "",
      secondary_color: "",
      size: "",
      material: "",
      notes: "",
      image: null,
      imageUrl: "",
    },
  });

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
      const dominantColor = await extractDominantColor(previewUrl);
      if (dominantColor) {
        form.setValue("color", dominantColor);
        toast.success("Couleur principale détectée");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Erreur lors de l'analyse de l'image");
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
      );
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        form.setValue("image", imageUrl);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Erreur lors de la capture de l'image");
    }
  };

  const handleUrlImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "url-image.jpg", { type: blob.type });
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        form.setValue("image", imageUrl);
        form.setValue("imageUrl", "");
      }
    } catch (error) {
      console.error("Error downloading image from URL:", error);
      toast.error("Erreur lors du téléchargement de l'image depuis l'URL");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Submitting form with values:", values);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un vêtement");
        return;
      }

      const { error } = await supabase.from("clothes").insert({
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
        user_id: user.id,
      });

      if (error) throw error;

      console.log("Successfully added clothing item");
      toast.success("Vêtement ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      form.reset();
      resetPreview();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding clothing:", error);
      toast.error("Erreur lors de l'ajout du vêtement");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ImageUploadTabs
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onUrlUpload={handleUrlImage}
        />

        {previewUrl && (
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
        )}

        <ClothingFormFields form={form} />

        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            "Ajouter"
          )}
        </Button>
      </form>
    </Form>
  );
};
