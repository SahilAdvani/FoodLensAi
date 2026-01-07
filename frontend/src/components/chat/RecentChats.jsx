import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

const RecentChats = ({ sessions }) => {
    const navigate = useNavigate(); // ✅ FIX
    const { t } = useTranslation();

    /* ---------------- Empty State ---------------- */
    if (!sessions || sessions.length === 0) {
        return (
            <div className="mb-4 animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">
                    {t("recent.header")}
                </h3>

                <div className="text-center text-gray-400 text-xs py-4 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                    {t("recent.empty")}
                </div>

                {/* View All (bottom centered) */}
                <button
                    onClick={() => navigate("/chat/history")}
                    className="mt-4 mx-auto block text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                    {t("recent.viewAll")}
                </button>
            </div>
        );
    }

    /* ---------------- Normal State ---------------- */
    return (
        <div className="mb-4 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">
                {t("recent.header")}
            </h3>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sessions.map((session) => (
                    <button
                        key={session.id}
                        onClick={() => navigate(`/chat/${session.id}`)}
                        className="flex items-start gap-3 p-3 text-left bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-green-200 dark:hover:border-green-900 hover:shadow-sm transition-all group"
                    >
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
                            <MessageSquare size={16} />
                        </div>

                        <div className="min-w-0">
                            <span className="block text-xs text-gray-400 mb-0.5 font-mono">
                                {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                                {session.title || t("history.chatSession")}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* View All (centered bottom, bigger) */}
            <button
                onClick={() => navigate("/chat/history")}
                className="mt-5 mx-auto block px-6 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm sm:text-base font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
                {t("recent.viewAll")}
            </button>
        </div>
    );
};

export default RecentChats;
