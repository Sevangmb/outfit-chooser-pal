import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Box, Shirt } from "lucide-react";

interface CategoryFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const CategoryFields = ({ form }: CategoryFieldsProps) => {
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

  return (
    <>
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Catégorie
            </FormLabel>
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
            <FormLabel className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Sous-catégorie
            </FormLabel>
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
    </>
  );
};