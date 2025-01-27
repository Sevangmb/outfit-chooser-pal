import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { socket } from "@/integrations/socket/client";
import { GroupChatRoom } from "./GroupChatRoom";
import { Message } from "@/types/social";

interface ChatRoomProps {
  type: "direct" | "group";
  recipientId: string | number;
  recipientName: string;
}

export const ChatRoom = ({ type, recipientId, recipientName }: ChatRoomProps) => {
  if (type === "group") {
    return (
      <GroupChatRoom 
        groupId={typeof recipientId === 'string' ? parseInt(recipientId, 10) : recipientId} 
        groupName={recipientName} 
      />
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (token) {
        socket.auth = { token };
        socket.connect();
        
        const room = `direct_${recipientId}`;
        socket.emit("join_room", room);
        
        socket.on("new_message", (message: Message) => {
          console.log("New direct message received:", message);
          setMessages(prev => [...prev, message]);
        });
      }
    };

    initializeChat();
    fetchMessages();

    return () => {
      socket.off("new_message");
      socket.emit("leave_room");
    };
  }, [recipientId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      if (!currentUserId) return;

      const { data, error } = await supabase
        .from("user_messages")
        .select(`
          id,
          content,
          created_at,
          sender:users!user_messages_sender_id_fkey (
            email,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log("Fetched direct messages:", data);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: sendError } = await supabase
        .from("user_messages")
        .insert({
          sender_id: user.id,
          recipient_id: recipientId.toString(),
          content: newMessage.trim()
        });

      if (sendError) throw sendError;
      setNewMessage("");
      toast.success("Message envoyé");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <AvatarImage src={message.sender.avatar_url || undefined} />
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
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage}>
          Envoyer
        </Button>
      </div>
    </div>
  );
};