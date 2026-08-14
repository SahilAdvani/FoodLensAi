import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

            // Clean up the URL hash only AFTER Supabase has successfully processed the session
            if (event === "SIGNED_IN" && window.location.hash && (window.location.hash.includes("access_token=") || window.location.hash.includes("error="))) {
                setTimeout(() => {
                    window.history.replaceState(
                        null, 
                        document.title, 
                        window.location.pathname + window.location.search
                    );
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
