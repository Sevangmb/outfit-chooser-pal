import { MessagingSection } from "@/components/messaging/MessagingSection";

const Messages = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-8 px-4 mx-auto mt-16">
        <h1 className="text-2xl font-semibold text-primary mb-6">Messages</h1>
        <MessagingSection />
      </div>
    </div>
  );
};

export default Messages;