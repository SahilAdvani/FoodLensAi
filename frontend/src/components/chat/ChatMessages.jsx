

export default function ChatMessages({
  messages,
  isLoading = false,
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 text-sm">
          Ask about any food ingredient…
        </p>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed
            ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
        >
          {msg.content}
        </div>
      ))}

      {isLoading && (
        <div className="mr-auto bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm animate-pulse">
          Thinking…
        </div>
      )}
    </div>
  );
}
