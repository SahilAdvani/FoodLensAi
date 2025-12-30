import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ChatHistory from "./pages/ChatHistory";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />

      <Route
        path="/chat/history"
        element={
          <ProtectedRoute>
            <ChatHistory />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
