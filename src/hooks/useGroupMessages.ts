import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { socket } from "@/integrations/socket/client";
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

export const useGroupMessages = (groupId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeSocket = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      if (token) {
        socket.auth = { token };
        socket.connect();
        
        const room = `group_${groupId}`;
        socket.emit("join_room", room);
        
        socket.on("new_message", (message: Message) => {
          console.log("New group message received:", message);
          setMessages(prev => [...prev, message]);
        });
      }
    };

    initializeSocket();
    fetchMessages();

    return () => {
      socket.off("new_message");
      socket.emit("leave_room");
    };
  }, [groupId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log("Fetched group messages:", data);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching group messages:", error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id;
      if (!currentUserId) throw new Error("Not authenticated");

      socket.emit("send_message", {
        type: "group",
        groupId,
        content: content.trim(),
        senderId: currentUserId
      });

      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        sender_id: currentUserId,
        content: content.trim(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending group message:", error);
      toast.error("Erreur lors de l'envoi du message");
      return false;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage
  };
};