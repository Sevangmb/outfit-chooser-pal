import { MessageList } from "./MessageList";
import { SendMessageDialog } from "./SendMessageDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: string;
  sender: {
    email: string;
  };
}

export const MessagingSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    type: "direct" | "group";
    id: string | number;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      console.log("Fetching messages for conversation:", selectedConversation);
      
      try {
        let query;
        if (selectedConversation.type === "direct") {
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUserId = sessionData?.session?.user?.id;
          
          query = supabase
            .from("user_messages")
            .select(`
              id,
              content,
              created_at,
              sender_id,
              sender:profiles!user_messages_sender_id_fkey(email)
            `)
            .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${selectedConversation.id}),and(sender_id.eq.${selectedConversation.id},recipient_id.eq.${currentUserId})`)
            .order("created_at", { ascending: true });
        } else {
          query = supabase
            .from("group_messages")
            .select(`
              id,
              content,
              created_at,
              sender_id,
              sender:profiles(email)
            `)
            .eq("group_id", Number(selectedConversation.id))
            .order("created_at", { ascending: true });
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching messages:", error);
          return;
        }

        console.log("Fetched messages:", data);
        setMessages(data || []);
      } catch (error) {
        console.error("Error in fetchMessages:", error);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: selectedConversation.type === 'direct' ? 'user_messages' : 'group_messages',
          filter: selectedConversation.type === 'direct' 
            ? `or(sender_id.eq.${selectedConversation.id},recipient_id.eq.${selectedConversation.id})`
            : `group_id=eq.${Number(selectedConversation.id)}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      <div className="md:col-span-1 bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Conversations</h3>
          <SendMessageDialog />
        </div>
        <MessageList 
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>
      
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm border">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">{selectedConversation.name}</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{message.sender.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Sélectionnez une conversation pour afficher les messages
          </div>
        )}
      </div>
    </div>
  );
};