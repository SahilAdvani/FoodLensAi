import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import Live from "@/pages/Live";
import Chat from "@/pages/Chat";
import ChatHistory from "@/pages/ChatHistory";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Layout from "@/components/layout/Layout";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/ui/Loader";

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
    <AuthProvider>
      <SmoothScroll>
        <Layout>
          <Loader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
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
    </AuthProvider>
  );
}
