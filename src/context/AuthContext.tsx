
"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  User 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Employee } from "@/types/restaurant";

interface AuthContextType {
  user: User | null;
  profile: Partial<Employee> | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<Employee> | null>(null);
  const [loading, setLoading] = useState(true);

  // Garante que o documento do funcionário exista no Firestore
  const syncProfile = async (firebaseUser: User, customName?: string) => {
    try {
      const docRef = doc(db, "employees", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newProfile: Partial<Employee> = {
          id: firebaseUser.uid,
          name: customName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Novo Usuário',
          email: firebaseUser.email || '',
          role: 'Garçom',
          status: 'Ativo',
          phone: '',
        };
        await setDoc(docRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
        });
        setProfile(newProfile);
      } else {
        setProfile(docSnap.data() as Employee);
      }
    } catch (error) {
      console.error("Erro ao sincronizar perfil:", error);
      // Fallback para não travar o app
      setProfile({ 
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário', 
        role: 'Garçom' 
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);
    await syncProfile(firebaseUser, name);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Forçar seleção de conta para evitar erros de cache
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    await syncProfile(result.user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
