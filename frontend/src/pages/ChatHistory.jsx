import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, ChevronRight, Search, Trash2, ArrowLeft, CheckSquare, Square } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserSessions, deleteSessions } from "@/services/api";
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 10;

export default function ChatHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Features State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [user]);

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

  const handleDelete = async () => {
    if (selectedSessions.size === 0) return;

    // Simple confirm using translated "Delete"
    if (!confirm(`${t('history.delete')} ${selectedSessions.size}?`)) return;

    setIsDeleting(true);
    try {
      await deleteSessions(Array.from(selectedSessions), user.id);

      // Remove from local state
      setSessions(prev => prev.filter(s => !selectedSessions.has(s.id)));
      setSelectedSessions(new Set());
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedSessions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSessions(newSet);
  };

  const toggleAll = () => {
    if (selectedSessions.size === currentSessions.length) {
      setSelectedSessions(new Set());
    } else {
      const newSet = new Set();
      currentSessions.forEach(s => newSet.add(s.id));
      setSelectedSessions(newSet);
    }
  };

  // Filter & Pagination Logic
  const filteredSessions = sessions.filter(session => {
    const title = session.title || t('history.chatSession');
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);
  const currentSessions = filteredSessions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-500">{t('history.loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" title={t('chat.back')}>
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('history.title')}</h1>
        </div>

        {selectedSessions.size > 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            {t('history.delete')} ({selectedSessions.size})
          </button>
        )}
      </div>

      {/* Search & Actions */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('history.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List */}
      {currentSessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p>{searchTerm ? t('history.noResults') : t('history.emptyState')}</p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/chat')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {t('history.startNew')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {currentSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative flex items-center p-4 bg-white dark:bg-gray-900 border rounded-xl transition-all ${selectedSessions.has(session.id)
                  ? 'border-green-500 bg-green-50/10'
                  : 'border-gray-200 dark:border-gray-800 hover:shadow-md'
                }`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelection(session.id); }}
                className="mr-4 p-1 text-gray-400 hover:text-green-600 focus:outline-none"
              >
                {selectedSessions.has(session.id) ? (
                  <CheckSquare size={20} className="text-green-600" />
                ) : (
                  <Square size={20} />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/chat/${session.id}`)}>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                    {session.title || t('history.chatSession')}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  ID: {session.id.slice(0, 8)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {t('history.previous')}
          </button>
          <span className="text-sm text-gray-500">
            {t('history.pageInfo', { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {t('history.next')}
          </button>
        </div>
      )}
    </div>
  );
}
