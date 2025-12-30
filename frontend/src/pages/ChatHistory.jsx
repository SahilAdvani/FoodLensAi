import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function ChatHistory() {
  const { userId } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/history?userId=${userId}`
        );
        const data = await res.json();
        setHistory(data.chats || []);
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading chat history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        No saved chats yet.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Your Chat History</h1>

      {history.map((chat) => (
        <div
          key={chat.id}
          className="border dark:border-gray-700 rounded-lg p-4"
        >
          {chat.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm mb-2 ${
                msg.role === "user"
                  ? "text-blue-600"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Ingredia"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
