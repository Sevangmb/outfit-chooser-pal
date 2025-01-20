import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { Palette } from "lucide-react";
import { useEffect } from "react";

interface ColorFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ColorFields = ({ form }: ColorFieldsProps) => {
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "color") {
        console.log("Color changed to:", value.color);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
              <div className="flex gap-2 items-center">
                <Input 
                  type="color" 
                  className="w-12 h-10 p-1 cursor-pointer" 
                  value={field.value || "#000000"}
                  onChange={(e) => {
                    console.log("Color picker changed to:", e.target.value);
                    field.onChange(e.target.value);
                  }}
                />
                <Input 
                  type="text"
                  placeholder="Blanc, Noir, etc." 
                  className="flex-1"
                  value={field.value || ""}
                  onChange={(e) => {
                    console.log("Text input changed to:", e.target.value);
                    field.onChange(e.target.value);
                  }}
                />
                {field.value && (
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: field.value }}
                    title="Couleur détectée"
                  />
                )}
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
              Couleur secondaire (optionnelle)
            </FormLabel>
            <FormControl>
              <div className="flex gap-2 items-center">
                <Input 
                  type="color" 
                  className="w-12 h-10 p-1 cursor-pointer" 
                  value={field.value || "#000000"}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                <Input 
                  type="text"
                  placeholder="Optionnel" 
                  className="flex-1"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                {field.value && (
                  <div 
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: field.value }}
                    title="Couleur secondaire"
                  />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};