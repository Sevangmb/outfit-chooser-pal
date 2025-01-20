import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../AddClothingForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClothingFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ClothingFormFields = ({ form }: ClothingFormFieldsProps) => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clothing_categories')
        .select('*')
        .is('parent_id', null);
      if (error) throw error;
      return data;
    }
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', form.watch('category')],
    queryFn: async () => {
      if (!form.watch('category')) return [];
      const { data, error } = await supabase
        .from('clothing_categories')
        .select('*')
        .eq('parent_id', categories?.find(c => c.name === form.watch('category'))?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!form.watch('category')
  });

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clothing_materials')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subcategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sous-catégorie</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch('category')}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subcategories?.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.name}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marque</FormLabel>
            <FormControl>
              <Input placeholder="Nike, Zara, etc." {...field} />
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
            <FormLabel>Couleur principale</FormLabel>
            <FormControl>
              <Input placeholder="Blanc, Noir, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="secondary_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Couleur secondaire</FormLabel>
            <FormControl>
              <Input placeholder="Optionnel" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Taille</FormLabel>
            <FormControl>
              <Input placeholder="S, M, L, 42, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Matière</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une matière" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {materials?.map((material) => (
                  <SelectItem key={material.id} value={material.name}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Notes personnelles (optionnel)" 
                className="resize-none" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};