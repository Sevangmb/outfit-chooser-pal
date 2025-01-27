import { useState } from "react";
import { MessageList } from "./MessageList";
import { SendMessageDialog } from "./SendMessageDialog";
import { ChatRoom } from "./ChatRoom";

interface Conversation {
  type: "direct" | "group";
  id: string | number;
  name: string;
}

export const MessagingSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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
            <ChatRoom
              type={selectedConversation.type}
              recipientId={selectedConversation.id}
            />
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