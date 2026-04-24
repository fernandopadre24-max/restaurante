
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
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          const docRef = doc(db, "employees", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as Employee);
          } else {
            setProfile({ name: user.displayName || user.email?.split('@')[0] || 'User', role: 'Garçom' });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        // Mesmo com erro, permite o acesso básico
        if (user) setProfile({ name: user.displayName || 'User', role: 'Garçom' });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("O sistema de autenticação não foi configurado. Verifique as variáveis de ambiente.");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!auth || !db) throw new Error("O banco de dados não está pronto. Verifique a configuração do Firebase.");
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Create initial employee profile
    await setDoc(doc(db, "employees", user.uid), {
      name,
      email,
      role: 'Garçom',
      status: 'Ativo',
      phone: ''
    });
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Login social indisponível no momento.");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginWithGoogle, logout }}>
      {children}
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
