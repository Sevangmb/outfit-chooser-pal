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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Sélectionnez au moins une catégorie"),
});

type FormData = z.infer<typeof formSchema>;

export const ShopProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
      console.log("Fetching shop categories...");
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

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Creating shop profile with data:", data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour créer une boutique");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("shop_profiles")
        .insert({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          website: data.website,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (profileError) {
        console.error("Error creating shop profile:", profileError);
        toast.error("Erreur lors de la création de la boutique");
        return;
      }

      if (data.categories.length > 0) {
        const categoryLinks = data.categories.map((categoryId) => ({
          shop_profile_id: profile.id,
          category_id: categoryId,
        }));

        const { error: categoriesError } = await supabase
          .from("shop_profile_categories")
          .insert(categoryLinks);

        if (categoriesError) {
          console.error("Error linking categories:", categoriesError);
          toast.error("Erreur lors de l'ajout des catégories");
          return;
        }
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