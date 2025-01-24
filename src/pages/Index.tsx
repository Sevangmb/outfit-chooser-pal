import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Users, User } from "lucide-react";

interface Activity {
  id: string;
  type: "group_message" | "friend_activity";
  content: string;
  created_at: string;
  sender: {
    email: string;
  };
  group_name?: string;
}

export default function Index() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      console.log("Fetching activities...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const user = sessionData?.session?.user;
      if (!user) return [];

      // Fetch group messages
      const { data: groupMessages, error: groupError } = await supabase
        .from("group_messages")
        .select(`
          id,
          content,
          created_at,
          sender:profiles!group_messages_sender_id_fkey(email),
          message_groups(name)
        `)
        .in(
          "group_id",
          supabase
            .from("message_group_members")
            .select("group_id")
            .eq("user_id", user.id)
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (groupError) {
        console.error("Error fetching group messages:", groupError);
        throw groupError;
      }

      // Format group messages
      const formattedGroupMessages: Activity[] = (groupMessages || []).map((msg) => ({
        id: `group_${msg.id}`,
        type: "group_message",
        content: msg.content,
        created_at: msg.created_at,
        sender: msg.sender,
        group_name: msg.message_groups?.name,
      }));

      // Fetch friend activities (messages between friends)
      const { data: friendMessages, error: friendError } = await supabase
        .from("user_messages")
        .select(`
          id,
          content,
          created_at,
          sender:profiles!user_messages_sender_id_fkey(email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (friendError) {
        console.error("Error fetching friend messages:", friendError);
        throw friendError;
      }

      // Format friend messages
      const formattedFriendMessages: Activity[] = (friendMessages || []).map((msg) => ({
        id: `friend_${msg.id}`,
        type: "friend_activity",
        content: msg.content,
        created_at: msg.created_at,
        sender: msg.sender,
      }));

      // Combine and sort all activities
      const allActivities = [...formattedGroupMessages, ...formattedFriendMessages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log("Activities fetched:", allActivities);
      return allActivities;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Fil d'actualité</h1>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex items-start gap-3">
                {activity.type === "group_message" ? (
                  <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.sender.email}</span>
                    {activity.group_name && (
                      <>
                        <span className="text-muted-foreground">dans</span>
                        <span className="font-medium">{activity.group_name}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm mt-1">{activity.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center text-muted-foreground">
              Aucune activité récente à afficher
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}