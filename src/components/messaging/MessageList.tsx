import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  profiles: {
    email: string;
  };
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

interface MessageListProps {
  onSelectConversation: (conversation: {
    type: "direct" | "group";
    id: string | number;
    name: string;
  } | null) => void;
  selectedConversation: {
    type: "direct" | "group";
    id: string | number;
    name: string;
  } | null;
}

export const MessageList = ({ onSelectConversation, selectedConversation }: MessageListProps) => {
  const { data: directMessages = [], isLoading: isLoadingDirect } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_messages")
        .select(`
          *,
          sender:sender_id(email),
          recipient:recipient_id(email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
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
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return [];

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

  const uniqueConversations = directMessages.reduce((acc, message) => {
    const { data: sessionData } = supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return acc;

    const otherUserId = message.sender_id === user.id 
      ? message.recipient_id 
      : message.sender_id;
    
    if (!acc.some(conv => conv.id === otherUserId)) {
      acc.push({
        type: "direct" as const,
        id: otherUserId,
        name: message.sender_id === user.id ? message.recipient.email : message.sender.email,
        lastMessage: message.content,
        timestamp: message.created_at,
      });
    }
    return acc;
  }, [] as Array<{
    type: "direct";
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
  }>);

  const groupConversations = groupMessages.reduce((acc, message) => {
    if (!acc.some(conv => conv.id === message.group_id)) {
      acc.push({
        type: "group" as const,
        id: message.group_id,
        name: message.message_groups.name,
        lastMessage: message.content,
        timestamp: message.created_at,
      });
    }
    return acc;
  }, [] as Array<{
    type: "group";
    id: number;
    name: string;
    lastMessage: string;
    timestamp: string;
  }>);

  const allConversations = [...uniqueConversations, ...groupConversations]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-1">
        {allConversations.map((conversation) => (
          <button
            key={`${conversation.type}-${conversation.id}`}
            onClick={() => onSelectConversation(conversation)}
            className={cn(
              "w-full p-3 text-left hover:bg-secondary/50 transition-colors",
              selectedConversation?.id === conversation.id && "bg-secondary"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{conversation.name}</span>
              <span className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.timestamp), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};