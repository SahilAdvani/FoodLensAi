import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clean up URL hash on mount if present
        if (window.location.hash) {
            setTimeout(() => {
                const cleanUrl = window.location.href.split('#')[0];
                window.history.replaceState(null, document.title, cleanUrl);
            }, 300);
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Clean up the URL hash (whether it has the token or just a trailing #)
            if (window.location.hash) {
                setTimeout(() => {
                    const cleanUrl = window.location.href.split('#')[0];
                    window.history.replaceState(null, document.title, cleanUrl);
                }, 100);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
            }
        });
        if (error) throw error;
        return data;
    };

    const signOut = () => {
        setUser(null);
        setSession(null);
        supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
