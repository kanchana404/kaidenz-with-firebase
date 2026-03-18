"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Use a minimal type instead of importing from firebase/auth to avoid SSR issues
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Dynamic imports prevent Firebase Auth from loading during SSR
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc } = await import("firebase/firestore");
      const { getFirebaseAuth, getFirebaseDb } = await import("@/lib/firebase");

      const firebaseAuth = await getFirebaseAuth();
      const firebaseDb = await getFirebaseDb();

      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
          try {
            const userDoc = await getDoc(doc(firebaseDb, "users", firebaseUser.uid));
            console.log("User doc exists:", userDoc.exists(), "data:", userDoc.data());
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setIsAdmin(true);
            } else {
              console.log("Not admin — role:", userDoc.exists() ? userDoc.data().role : "doc not found");
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }

        setLoading(false);
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { signOut } = await import("firebase/auth");
    const { getFirebaseAuth } = await import("@/lib/firebase");
    const auth = await getFirebaseAuth();
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
