import { useSelector } from "react-redux";
import { MessageSquare, Calendar } from "lucide-react";

export default function ChatHistory() {
  const { history } = useSelector((state) => state.chat);

  if (!history || history.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-gray-400">
        <MessageSquare size={48} className="mb-4 opacity-30" />
        <p>No saved chats yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Chat History</h1>

      <div className="space-y-4">
        {history.map((chat) => (
          <div
            key={chat.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                {chat.preview}
              </h3>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                <Calendar size={12} /> {chat.date}
              </span>
            </div>

            <div className="space-y-2">
              {chat.messages.slice(0, 2).map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  <span className="font-medium text-gray-900 dark:text-gray-300">
                    {msg.role === 'user' ? 'You' : 'FoodLensAI'}:
                  </span> {msg.content}
                </p>
              ))}
              {chat.messages.length > 2 && (
                <p className="text-xs text-gray-400 italic mt-1">
                  + {chat.messages.length - 2} more messages...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
