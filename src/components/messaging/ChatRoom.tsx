import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: {
    email: string;
    avatar_url?: string;
  };
}

interface ChatRoomProps {
  type: "direct" | "group";
  recipientId: string | number;
  recipientName: string;
}

export const ChatRoom = ({ type, recipientId, recipientName }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      if (!currentUserId) return;

      let query;
      if (type === "direct") {
        query = supabase
          .from("user_messages")
          .select(`
            id,
            content,
            created_at,
            sender:profiles!user_messages_sender_id_fkey(
              email,
              avatar_url
            )
          `)
          .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
          .order("created_at", { ascending: true });
      } else {
        query = supabase
          .from("group_messages")
          .select(`
            id,
            content,
            created_at,
            sender:profiles!group_messages_sender_id_fkey(
              email,
              avatar_url
            )
          `)
          .eq("group_id", recipientId)
          .order("created_at", { ascending: true });
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: type === "direct" ? "user_messages" : "group_messages",
        },
        (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, recipientId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      if (!currentUserId) throw new Error("Not authenticated");

      if (type === "direct") {
        const { error } = await supabase.from("user_messages").insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim(),
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.from("group_messages").insert({
          sender_id: currentUserId,
          group_id: recipientId,
          content: newMessage.trim(),
        });

        if (error) throw error;
      }

      setNewMessage("");
      toast.success("Message envoyé");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{recipientName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={message.sender.avatar_url} />
                <AvatarFallback>
                  {message.sender.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
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
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? "Envoi..." : "Envoyer"}
        </Button>
      </div>
    </div>
  );
};