const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
