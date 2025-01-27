import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { User, Users } from "lucide-react";

interface Message {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_deleted: boolean | null;
  sender: {
    email: string;
  } | null;
  recipient: {
    email: string;
  } | null;
}

interface GroupMessage {
  id: number;
  group_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  message_groups: {
    name: string;
  } | null;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        setCurrentUserId(sessionData.session.user.id);
      }
    };
    getUser();
  }, []);

  const { data: directMessages = [], isLoading: isLoadingDirect } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      console.log("Fetching direct messages...");
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_messages")
        .select(`
          *,
          sender:users!user_messages_sender_id_fkey(email),
          recipient:users!user_messages_recipient_id_fkey(email)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching direct messages:", error);
        throw error;
      }
      console.log("Direct messages fetched:", data);
      return data as Message[];
    },
    enabled: !!currentUserId
  });

  const { data: groupMessages = [], isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groupMessages"],
    queryFn: async () => {
      console.log("Fetching group messages...");
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return [];

      const { data: memberGroups, error: memberError } = await supabase
        .from("message_group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (memberError) {
        console.error("Error fetching member groups:", memberError);
        throw memberError;
      }

      const groupIds = memberGroups?.map(g => g.group_id) || [];
      
      if (groupIds.length === 0) {
        console.log("User is not a member of any groups");
        return [];
      }

      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          message_groups (
            name
          )
        `)
        .in("group_id", groupIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching group messages:", error);
        throw error;
      }
      console.log("Group messages fetched:", data);
      return data as GroupMessage[];
    },
    enabled: !!currentUserId
  });

  if (isLoadingDirect || isLoadingGroup) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const uniqueConversations = directMessages.reduce((acc, message) => {
    if (!currentUserId || !message.sender || !message.recipient) return acc;
    
    const otherUserId = message.sender_id === currentUserId 
      ? message.recipient_id 
      : message.sender_id;
    
    const otherUserEmail = message.sender_id === currentUserId 
      ? message.recipient?.email 
      : message.sender?.email;

    if (!otherUserEmail) return acc;

    if (!acc.some(conv => conv.id === otherUserId)) {
      acc.push({
        type: "direct" as const,
        id: otherUserId,
        name: otherUserEmail,
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
    if (!message.message_groups?.name) return acc;

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
            <div className="flex items-start gap-3">
              {conversation.type === "direct" ? (
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              ) : (
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{conversation.name}</span>
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
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};