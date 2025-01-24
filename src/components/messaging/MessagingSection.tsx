import { MessageList } from "./MessageList";
import { SendMessageDialog } from "./SendMessageDialog";

export const MessagingSection = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Messages</h2>
        <SendMessageDialog />
      </div>
      <MessageList />
    </div>
  );
};