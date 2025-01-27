import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GroupChatRoomProps {
  groupId: number;
  groupName: string;
}

export const GroupChatRoom = ({ groupId, groupName }: GroupChatRoomProps) => {
  const [newMessage, setNewMessage] = useState("");
  const { messages, loading: isLoading, error } = useGroupMessages(groupId);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: sendError } = await supabase
        .from("group_messages")
        .insert({
          group_id: groupId,
          sender_id: user.id,
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">{groupName}</h3>
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
