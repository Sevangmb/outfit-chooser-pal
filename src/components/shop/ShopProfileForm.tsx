import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface ShopProfileFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  categories: string[];
}

export const ShopProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShopProfileFormData>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      website: "",
      categories: [],
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["shopCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching shop categories:", error);
        throw error;
      }

      return data;
    },
  });

  const onSubmit = async (data: ShopProfileFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Creating shop profile with data:", data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("shop_profiles")
        .insert({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          website: data.website,
          user_id: user.id,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      if (data.categories.length > 0) {
        const categoryLinks = data.categories.map((categoryId) => ({
          shop_profile_id: profile.id,
          category_id: categoryId,
        }));

        const { error: categoriesError } = await supabase
          .from("shop_profile_categories")
          .insert(categoryLinks);

        if (categoriesError) throw categoriesError;
      }

      toast.success("Profil boutique créé avec succès");
      form.reset();
    } catch (error) {
      console.error("Error creating shop profile:", error);
      toast.error("Erreur lors de la création du profil boutique");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la boutique</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ma Boutique" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Décrivez votre boutique..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} placeholder="123 rue du Commerce" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+33 1 23 45 67 89" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site web</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://www.maboutique.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégories</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([...field.value, value])}
                value={field.value[0]}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création..." : "Créer ma boutique"}
        </Button>
      </form>
    </Form>
  );
};