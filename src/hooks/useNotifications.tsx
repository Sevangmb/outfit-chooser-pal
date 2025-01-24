import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications count...");
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (!session) {
          console.log("No session found, returning 0");
          return 0;
        }

        console.log("Fetching unread messages for user:", session.user.id);
        const { count, error } = await supabase
          .from("admin_messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .is("read_at", null);

        if (error) {
          console.error("Error fetching notifications:", error);
          throw error;
        }

        console.log("Unread messages count:", count);
        return count || 0;
      } catch (error) {
        console.error("Error in notification query:", error);
        return 0;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });
};