import { useAuth } from "@clerk/clerk-react";
import ChatInput from "../components/chat/ChatInput";
import ChatMessages from "../components/chat/ChatMessages";

export default function Chat() {
  const { isSignedIn, userId } = useAuth();

  const handleSend = async (message) => {
    // Always send to backend
    await sendMessage(message);

    // Save history only if logged in
    if (isSignedIn) {
      await saveChatHistory(userId, message);
    }
  };

  return (
    <div className="chat-container">
      <ChatMessages />
      <ChatInput onSend={handleSend} />

      {!isSignedIn && (
        <p className="text-sm text-gray-400 text-center">
          🔒 Login to save chat history
        </p>
      )}
    </div>
  );
}
