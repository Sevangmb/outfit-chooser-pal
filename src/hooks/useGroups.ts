import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Group {
  id: number;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  cover_image: string | null;
  created_by: string;
  created_at: string;
  rules: string | null;
  member_count: number;
}

export interface NewGroup {
  name: string;
  description: string;
  privacy: 'public' | 'private' | 'secret';
}

export const useGroups = () => {
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("message_groups")
        .select(`
          *,
          member_count:message_group_members(count)
        `);

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }

      const transformedGroups = data.map(group => ({
        ...group,
        member_count: group.member_count[0]?.count || 0
      }));

      console.log("Groups fetched:", transformedGroups);
      return transformedGroups as Group[];
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: NewGroup) => {
      console.log("Creating group:", newGroup);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data: group, error } = await supabase
        .from("message_groups")
        .insert([{
          ...newGroup,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from("message_group_members")
        .insert([
          {
            group_id: group.id,
            user_id: userId,
            role: "admin",
            is_approved: true,
          },
        ]);

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Groupe créé avec succès");
    },
    onError: (error) => {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création du groupe");
    },
  });

  return {
    groups,
    isLoading,
    createGroup: createGroupMutation.mutate,
    isCreating: createGroupMutation.isPending
  };
};