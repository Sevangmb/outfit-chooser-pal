import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ruler, Scissors } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailsFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const DetailsFields = ({ form }: DetailsFieldsProps) => {
  const [openBrand, setOpenBrand] = useState(false);
  const [openMaterial, setOpenMaterial] = useState(false);

  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      console.log("Fetching materials...");
      const { data, error } = await supabase
        .from('clothing_materials')
        .select('*')
        .order('name');
      if (error) {
        console.error("Error fetching materials:", error);
        throw error;
      }
      console.log("Materials fetched:", data);
      return data || [];
    }
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log("Fetching brands...");
      const { data, error } = await supabase
        .from('clothing_brands')
        .select('*')
        .order('name');
      if (error) {
        console.error("Error fetching brands:", error);
        throw error;
      }
      console.log("Brands fetched:", data);
      return data || [];
    }
  });

  return (
    <>
      <FormField
        control={form.control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Taille
            </FormLabel>
            <FormControl>
              <Input placeholder="S, M, L, 42, etc." {...field} />
            </FormControl>
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
            <Popover open={openBrand} onOpenChange={setOpenBrand}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openBrand}
                    className="w-full justify-between"
                    disabled={brandsLoading}
                  >
                    {field.value
                      ? brands?.find((brand) => brand.name === field.value)?.name
                      : "Sélectionner une marque"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une marque..." />
                  <CommandEmpty>Aucune marque trouvée.</CommandEmpty>
                  <CommandGroup>
                    {(brands || []).map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.name}
                        onSelect={() => {
                          form.setValue("brand", brand.name);
                          setOpenBrand(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === brand.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="material"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              Matière
            </FormLabel>
            <Popover open={openMaterial} onOpenChange={setOpenMaterial}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMaterial}
                    className="w-full justify-between"
                    disabled={materialsLoading}
                  >
                    {field.value
                      ? materials?.find((material) => material.name === field.value)?.name
                      : "Sélectionner une matière"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Rechercher une matière..." />
                  <CommandEmpty>Aucune matière trouvée.</CommandEmpty>
                  <CommandGroup>
                    {(materials || []).map((material) => (
                      <CommandItem
                        key={material.id}
                        value={material.name}
                        onSelect={() => {
                          form.setValue("material", material.name);
                          setOpenMaterial(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === material.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {material.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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