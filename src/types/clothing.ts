import { z } from "zod";

export const clothingFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  secondary_color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  notes: z.string().optional(),
  image: z.string().nullable(),
  imageUrl: z.string().optional(),
  is_for_sale: z.boolean().optional().default(false),
  purchase_price: z.number().optional().nullable(),
  selling_price: z.number().optional().nullable(),
  location: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export type FormValues = z.infer<typeof clothingFormSchema>;