import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clothingFormSchema, FormValues } from "@/types/clothing";

export const useClothingForm = (onSuccess?: (values: FormValues) => void) => {
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(clothingFormSchema),
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
    mode: "onChange",
  });

  console.log("Form state:", {
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
    values: form.getValues()
  });

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
        subcategory: values.subcategory || null,
        brand: values.brand || null,
        color: values.color,
        secondary_color: values.secondary_color || null,
        size: values.size || null,
        material: values.material || null,
        notes: values.notes || null,
        image: values.image,
        user_id: user.id,
      });

      if (error) {
        console.error("Error adding clothing:", error);
        toast.error("Erreur lors de l'ajout du vêtement");
        return;
      }

      console.log("Successfully added clothing item");
      await queryClient.invalidateQueries({ queryKey: ["clothes"] });
      form.reset();
      onSuccess?.(values);
    } catch (error) {
      console.error("Error adding clothing:", error);
      toast.error("Erreur lors de l'ajout du vêtement");
    }
  };

  return {
    form,
    onSubmit,
    isValid: form.formState.isDirty && Object.keys(form.formState.errors).length === 0,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  };
};