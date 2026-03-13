import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isRegistered: boolean | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isRegistered: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  
  // Use a ref to track registration status to avoid stale closures in the listener
  const isRegisteredRef = useRef<boolean | null>(null);
  const checkingRef = useRef<string | null>(null);

  const checkRegistration = async (userId: string) => {
    // Avoid redundant checks for the same user if already checking or checked
    if (checkingRef.current === userId) return;
    checkingRef.current = userId;

    try {
      console.log(`Checking registration for user: ${userId}`);
      const { data, error } = await supabase
        .from("profiles")
        .select("tr_number")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking registration:", error);
        isRegisteredRef.current = false;
        setIsRegistered(false);
      } else {
        const registered = !!data;
        console.log(`Registration status for ${userId}: ${registered}`);
        isRegisteredRef.current = registered;
        setIsRegistered(registered);
      }
    } catch (err) {
      console.error("Unexpected error checking registration:", err);
      isRegisteredRef.current = false;
      setIsRegistered(false);
    } finally {
      checkingRef.current = null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      console.log(`Auth event [${event}] triggered. Session exists: ${!!currentSession}`);
      
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // If we don't have a registration status yet, or it's a sign-in event, we should check
        if (isRegisteredRef.current === null || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setLoading(true);
          await checkRegistration(currentUser.id);
        }
      } else {
        isRegisteredRef.current = null;
        setIsRegistered(null);
      }
      
      if (mounted) {
        setLoading(false);
        console.log(`Auth state stabilized. Loading: false, User: ${currentUser?.id}`);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthChange(event, session);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange("INITIAL_SESSION", session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isRegistered, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
