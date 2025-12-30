import { Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

import Home from "@/pages/Home";
import Live from "@/pages/Live";
import Chat from "@/pages/Chat";
import ChatHistory from "@/pages/ChatHistory";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Layout from "@/components/layout/Layout";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import SmoothScroll from "@/components/SmoothScroll";

export default function App() {
  const { currentLanguage } = useSelector((state) => state.language);
  const { i18n } = useTranslation();

  useEffect(() => {
    // Map Redux state (en-IN, hi-IN) to i18next keys (en, hi)
    const langKey = currentLanguage === 'hi-IN' ? 'hi' : 'en';
    if (i18n.language !== langKey) {
      i18n.changeLanguage(langKey);
    }
  }, [currentLanguage, i18n]);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <SmoothScroll>
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
      </SmoothScroll>
    </ClerkProvider>
  );
}
