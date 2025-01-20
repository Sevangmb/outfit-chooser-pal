import { z } from "zod";

export const clothingFormSchema = z.object({
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

export type FormValues = z.infer<typeof clothingFormSchema>;