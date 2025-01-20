import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from "zod";

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

export const useClothingForm = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
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
      onSuccess?.();
    } catch (error) {
      console.error("Error adding clothing:", error);
      toast.error("Erreur lors de l'ajout du vêtement");
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};