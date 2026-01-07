import { useState } from "react";


export default function ChatInput({
  onSend,
  disabled = false,
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="border-t dark:border-gray-700 px-3 py-2 flex items-center gap-2">
      <input
        type="text"
        placeholder="Ask about ingredients…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={disabled}
        className="flex-1 rounded-lg px-3 py-2 text-sm
                   bg-gray-100 dark:bg-gray-800
                   text-black dark:text-white
                   outline-none"
      />

      <button
        onClick={handleSend}
        disabled={disabled}
        className="bg-blue-600 hover:bg-blue-700
                   text-white text-sm px-4 py-2
                   rounded-lg disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
