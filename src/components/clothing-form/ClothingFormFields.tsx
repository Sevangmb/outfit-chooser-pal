import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface FormValues {
  name: string;
  category: string;
  color: string;
  image: string | null;
  imageUrl?: string;
}

interface ClothingFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ClothingFormFields = ({ form }: ClothingFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input placeholder="T-shirt blanc" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie</FormLabel>
            <FormControl>
              <Input placeholder="Haut" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Couleur</FormLabel>
            <FormControl>
              <Input placeholder="Blanc" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};