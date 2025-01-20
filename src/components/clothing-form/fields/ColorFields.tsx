import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../../AddClothingForm";
import { Palette } from "lucide-react";

interface ColorFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ColorFields = ({ form }: ColorFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Couleur principale
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  className="w-12 h-10 p-1 cursor-pointer" 
                  {...field} 
                />
                <Input 
                  type="text"
                  placeholder="Blanc, Noir, etc." 
                  className="flex-1"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
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
            <FormLabel className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Couleur secondaire
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input 
                  type="color" 
                  className="w-12 h-10 p-1 cursor-pointer" 
                  {...field} 
                />
                <Input 
                  type="text"
                  placeholder="Optionnel" 
                  className="flex-1"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};