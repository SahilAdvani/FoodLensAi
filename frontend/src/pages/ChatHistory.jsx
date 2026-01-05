import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions } from "@/services/api";

export default function ChatHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.id) {
        try {
          const data = await getUserSessions(user.id);
          setSessions(data || []);
        } catch (error) {
          console.error("Failed to load sessions", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSessions();
  }, [user]);

  const handleSessionClick = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading history...</div>;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-gray-400">
        <MessageSquare size={48} className="mb-4 opacity-30" />
        <p>No saved chats yet.</p>
        <button
          onClick={() => navigate('/chat')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Start a New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Chat History</h1>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session.id)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg group-hover:text-green-600 transition-colors">
                Chat Session
              </h3>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={12} />
              {new Date(session.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
