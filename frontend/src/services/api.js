const API_URL = import.meta.env.DEV
    ? 'http://localhost:8000'
    : import.meta.env.VITE_PROD_API_URL;

/* ---------------- core helpers ---------------- */

const DEFAULT_TIMEOUT = 30000;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return res;
    } finally {
        clearTimeout(id);
    }
}

async function fetchJSON(url, options) {
    const res = await fetchWithTimeout(url, options);
    if (!res.ok) {
        let err;
        try {
            err = await res.json();
        } catch {
            err = { detail: res.statusText };
        }
        throw new Error(err.detail || 'Request failed');
    }
    return res.json();
}

async function fetchBlob(url, options) {
    const res = await fetchWithTimeout(url, options);
    if (!res.ok) {
        throw new Error(`Request failed: ${res.statusText}`);
    }
    return res.blob();
}

/* ---------------- sessions ---------------- */

export const createSession = async (mode = 'live', userId = null) => {
    const data = await fetchJSON(`${API_URL}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, user_id: userId }),
    });
    return data.session_id;
};

export const generateSessionTitle = async (sessionId, text) => {
    try {
        return await fetchJSON(
            `${API_URL}/sessions/${sessionId}/title`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            }
        );
    } catch {
        return { title: 'Chat Session' };
    }
};

export const getUserSessions = async userId =>
    fetchJSON(`${API_URL}/sessions/${userId}`);

export const deleteSessions = async (sessionIds, userId) =>
    fetchJSON(`${API_URL}/sessions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_ids: sessionIds, user_id: userId }),
    });

/* ---------------- vision ---------------- */

export const analyzeImage = async (
    imageBlob,
    sessionId,
    userId = null,
    language = 'en'
) => {
    const form = new FormData();
    form.append('image', imageBlob, 'capture.jpg');
    form.append('session_id', sessionId);
    if (userId) form.append('user_id', userId);
    form.append('language', language);

    const res = await fetchWithTimeout(`${API_URL}/analyze`, {
        method: 'POST',
        body: form,
    }, 60000);

    if (!res.ok) {
        let err = {};
        try {
            err = await res.json();
        } catch { }
        throw new Error(err.detail || 'Analysis failed');
    }

    return res.json();
};

/* ---------------- chat ---------------- */

export const sendMessage = async (
    sessionId,
    message,
    userId = null
) =>
    fetchJSON(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            message,
            user_id: userId,
        }),
    });

export const getChatHistory = async sessionId => {
    try {
        return await fetchJSON(
            `${API_URL}/chat/history/${sessionId}`
        );
    } catch {
        return [];
    }
};

/* ---------------- TTS ---------------- */

export const textToSpeech = async (
    text,
    voiceId = 'RABOvaPec1ymXz02oDQi'
) =>
    fetchBlob(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voiceId }),
    });
