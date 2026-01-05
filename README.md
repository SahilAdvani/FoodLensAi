# FoodLens AI 🍎🤖

FoodLens AI is an intelligent nutrition assistant that combines **OCR (Optical Character Recognition)**, **RAG (Retrieval-Augmented Generation)**, and **Interactive Chat** to help users understand food ingredients, allergies, and safety.

## 🚀 Features

*   **Live Mode**: Real-time camera ingredient scanning and analysis.
*   **Chat Mode**: Conversational AI that remembers context. Ask follow-up questions about scanned food!
*   **Image Analysis**: Upload or capture photos of food labels to get instant safety breakdowns.
*   **Session History**: Resume past conversations with persistent chat history.
*   **Multi-language**: Supports English and Hindi.

## 🛠️ Tech Stack

### Frontend
*   **React + Vite**: Fast, modern UI.
*   **Tailwind CSS**: Responsive styling.
*   **Redux Toolkit**: State management.
*   **React Router**: Navigation and URL-based sessions.
*   **Supabase Auth**: Secure user authentication.

### Backend
*   **FastAPI**: High-performance Python web framework.
*   **PyTorch + Sentence Transformers**: Embedding generation.
*   **FAISS**: Vector search for RAG.
*   **Tesseract OCR**: Text extraction from images.
*   **Supabase**: PostgreSQL database for chat history.
*   **OpenAI/GitHub Models**: LLM for reasoning and response generation.

---

## 📋 Prerequisites

*   **Node.js** (v18+)
*   **Python** (v3.10+)
*   **Docker Desktop** (Optional, for containerization)
*   **Tesseract OCR** (Required for local backend):
    *   *Windows*: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki) (Install to default path or update `ocr.py`)
    *   *Mac*: `brew install tesseract`
    *   *Linux*: `sudo apt-get install tesseract-ocr`

---

## ⚙️ Installation & Setup

### 1. Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    # Windows
    .\.venv\Scripts\activate
    # Mac/Linux
    source .venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure Environment Variables:
    Create a `.env` file in `backend/` and add:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    GITHUB_TOKEN_FINE=your_github_token_for_models
    ```

5.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    Backend will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup

1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2.  Install packages:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in `frontend/` and add:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    VITE_API_URL=http://127.0.0.1:8000  # Points to local backend
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```
    Frontend will run on `http://localhost:5173`.

---

## 🐳 Docker Deployment

The backend is containerized for easy deployment (e.g., on Render).

```bash
# Build the image (CPU-optimized)
cd backend
docker build -t foodlens-backend .

# Run the container
docker run -p 10000:10000 --env-file .env foodlens-backend
```

**Note**: The Dockerfile is optimized to install specific CPU-only versions of PyTorch to keep the image size small (~1-2GB) suitable for standard cloud tiers.

---

## 📱 Usage

1.  **Register/Login**: Use Email or Google Auth (via Supabase).
2.  **Home/Chat**: Start chatting immediately.
3.  **Upload/Scan**: Click the **Camera Icon** in the chat bar or type *"scan"* to open the camera.
4.  **History**: Click the "History" (clock icon) or access Recent Sessions from the main chat page.

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
