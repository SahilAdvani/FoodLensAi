const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Generate Session Title
export const generateSessionTitle = async (sessionId, text) => {
    try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}/title`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to generate title", error);
        return { title: "Chat Session" };
    }
};

export const createSession = async (mode = "live", userId = null) => {
    try {
        const response = await fetch(`${API_URL}/session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ mode, user_id: userId }),
        });

        if (!response.ok) {
            throw new Error("Failed to create session");
        }

        const data = await response.json();
        return data.session_id;
    } catch (error) {
        console.error("Error creating session:", error);
        throw error;
    }
};

export const analyzeImage = async (imageBlob, sessionId, userId = null) => {
    try {
        const formData = new FormData();
        formData.append("image", imageBlob, "capture.jpg");
        formData.append("session_id", sessionId);
        if (userId) {
            formData.append("user_id", userId);
        }

        const response = await fetch(`${API_URL}/analyze`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Analysis failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
    }
};

export const sendMessage = async (sessionId, message, userId = null) => {
    try {
        const response = await fetch(`${API_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                message: message,
                user_id: userId
            }),
        });

        if (!response.ok) {
            throw new Error(`Chat API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const getChatHistory = async (sessionId) => {
    try {
        const response = await fetch(`${API_URL}/chat/history/${sessionId}`);
        if (!response.ok) {
            throw new Error(`History API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

export const getUserSessions = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/sessions/${userId}`);
        if (!response.ok) {
            throw new Error(`Sessions API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return [];
    }
};
