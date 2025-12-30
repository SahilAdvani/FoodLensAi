import { Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "@/store/store";

import Home from "@/pages/Home";
import Live from "@/pages/Live";
import Chat from "@/pages/Chat";
import ChatHistory from "@/pages/ChatHistory";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Layout from "@/components/layout/Layout";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

export default function App() {
  return (
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<Live />} />
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
        </Layout>
      </ClerkProvider>
    </Provider>
  );
}
