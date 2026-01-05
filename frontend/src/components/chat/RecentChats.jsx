import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const RecentChats = ({ sessions }) => {
    const navigate = useNavigate();

    if (!sessions || sessions.length === 0) return null;

    return (
        <div className="mb-4 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Recent Chats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sessions.map(session => (
                    <button
                        key={session.id}
                        onClick={() => navigate(`/chat/${session.id}`)}
                        className="flex items-start gap-3 p-3 text-left bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-green-200 dark:hover:border-green-900 hover:shadow-sm transition-all group"
                    >
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <span className="block text-xs text-gray-400 mb-0.5 font-mono">
                                {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                                {session.title || "Chat Session"}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentChats;
