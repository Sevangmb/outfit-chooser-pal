import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatRoomProps {
  recipientId: string | number;
  type: "direct" | "group";
}

export const ChatRoom = ({ recipientId, type }: ChatRoomProps) => {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  if (!user) {
    return <div>Vous devez être connecté pour accéder au chat.</div>;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      if (type === "direct") {
        const { error: sendError } = await supabase
          .from("user_messages")
          .insert({
            sender_id: user.id,
            recipient_id: recipientId.toString(),
            content: newMessage.trim()
          });

        if (sendError) throw sendError;
      } else {
        const { error: sendError } = await supabase
          .from("group_messages")
          .insert({
            group_id: Number(recipientId),
            sender_id: user.id,
            content: newMessage.trim()
          });

        if (sendError) throw sendError;
      }

      setNewMessage("");
      toast.success("Message envoyé !");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const renderMessages = () => {
    if (type === "group") {
      const { messages, loading: isLoading, error } = useGroupMessages(Number(recipientId));

      if (isLoading) {
        return <div>Chargement des messages...</div>;
      }

      if (error) {
        return <div>Erreur lors du chargement des messages</div>;
      }

      return (
        <div className="flex flex-col space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.sender.id === user.id
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      );
    }

    // Direct messages rendering will be implemented here
    return <div>Messages directs à implémenter</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {renderMessages()}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
          />
          <Button type="submit">Envoyer</Button>
        </div>
      </form>
    </div>
  );
};