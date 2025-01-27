import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGroupMembers = (groupId: number) => {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_group_members")
        .select(`
          *,
          profiles!message_group_members_user_id_fkey (
            id,
            username,
            email
          )
        `)
        .eq("group_id", groupId);

      if (error) throw error;
      return data;
    },
  });
};