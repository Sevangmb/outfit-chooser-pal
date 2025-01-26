import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Globe, Lock, EyeOff } from "lucide-react";
import { NewGroup } from "@/hooks/useGroups";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const groupSchema = z.object({
  name: z.string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  description: z.string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  privacy: z.enum(["public", "private", "secret"])
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface CreateGroupDialogProps {
  onCreateGroup: (group: NewGroup) => void;
  isCreating: boolean;
}

export const CreateGroupDialog = ({ onCreateGroup, isCreating }: CreateGroupDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public"
    }
  });

  const onSubmit = (values: GroupFormValues) => {
    onCreateGroup(values);
    if (!isCreating) {
      setIsOpen(false);
      form.reset();
    }
  };

  const privacyOptions = [
    {
      value: "public",
      label: "Public",
      description: "Tout le monde peut voir et rejoindre le groupe",
      icon: Globe
    },
    {
      value: "private",
      label: "Privé",
      description: "Le groupe est visible mais nécessite une approbation pour rejoindre",
      icon: Lock
    },
    {
      value: "secret",
      label: "Secret",
      description: "Le groupe est invisible et accessible uniquement sur invitation",
      icon: EyeOff
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Créer un groupe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau groupe</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du groupe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Club de lecture" {...field} />
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
                      placeholder="Décrivez le but et les règles de votre groupe..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidentialité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez la confidentialité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {privacyOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="flex items-center gap-2 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? "Création..." : "Créer le groupe"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};