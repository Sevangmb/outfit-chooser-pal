import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface GroupMessage {
  id: number;
  group_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  message_groups: {
    name: string;
  };
}

export const MessageList = () => {
  const { data: directMessages = [], isLoading: isLoadingDirect } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("user_messages")
        .select("*")
        .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      return data as Message[];
    },
  });

  const { data: groupMessages = [], isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupMessages"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          message_groups (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching group messages:", error);
        throw error;
      }

      return data as GroupMessage[];
    },
  });

  if (isLoadingDirect || isLoadingGroup) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="direct" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="direct">Messages Directs</TabsTrigger>
        <TabsTrigger value="group">Messages de Groupe</TabsTrigger>
      </TabsList>

      <TabsContent value="direct">
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {directMessages.map((message) => (
              <div
                key={message.id}
                className="flex flex-col space-y-1 bg-secondary/30 p-4 rounded-lg"
              >
                <p className="text-sm text-foreground">{message.content}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="group">
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {groupMessages.map((message) => (
              <div
                key={message.id}
                className="flex flex-col space-y-1 bg-secondary/30 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-primary">
                    {message.message_groups.name}
                  </span>
                </div>
                <p className="text-sm text-foreground">{message.content}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};