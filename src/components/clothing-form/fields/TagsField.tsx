import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TagsFieldProps {
  form: UseFormReturn<FormValues>;
}

export const TagsField = ({ form }: TagsFieldProps) => {
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: userTags = [] } = useQuery({
    queryKey: ["userTags"],
    queryFn: async () => {
      console.log("Fetching user tags...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("clothing_tags")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tags:", error);
        toast.error("Erreur lors du chargement des tags");
        return [];
      }

      return data || [];
    }
  });

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter des tags");
        return;
      }

      const { data, error } = await supabase
        .from("clothing_tags")
        .insert({ name: newTag.trim(), user_id: user.id })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("Ce tag existe déjà");
        } else {
          console.error("Error adding tag:", error);
          toast.error("Erreur lors de l'ajout du tag");
        }
        return;
      }

      setSelectedTags([...selectedTags, data.name]);
      setNewTag("");
    } catch (error) {
      console.error("Error in handleAddTag:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <FormField
      control={form.control}
      name="tags"
      render={() => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {userTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    if (!selectedTags.includes(tag.name)) {
                      setSelectedTags([...selectedTags, tag.name]);
                    }
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};