
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
import { doc, getDoc, setDoc, serverTimestamp, getFirestore } from "firebase/firestore";
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
    console.log("[AuthContext] Sincronizando perfil para:", firebaseUser.uid);
    try {
      const docRef = doc(db, "employees", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log("[AuthContext] Perfil não encontrado, criando novo...");
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
        console.log("[AuthContext] Perfil criado com sucesso");
        setProfile(newProfile);
      } else {
        console.log("[AuthContext] Perfil carregado do Firestore");
        setProfile(docSnap.data() as Employee);
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao sincronizar perfil:", error);
      // Fallback para não travar o app
      setProfile({ 
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário', 
        role: 'Garçom' 
      });
    }
  };

  useEffect(() => {
    console.log("[AuthContext] Inicializando onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AuthContext] Estado de auth mudou:", firebaseUser ? "Logado" : "Deslogado");
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncProfile(firebaseUser);
      } else {
        setUser(null);
        // Perfil padrão para modo livre
        setProfile({
          id: "guest",
          name: "Convidado (Modo Livre)",
          role: "Gerente",
          email: "guest@chefpro.com",
          status: "Ativo"
        });
      }
      setLoading(false);
      console.log("[AuthContext] Carregamento finalizado");
    }, (error) => {
      console.error("[AuthContext] Erro crítico no onAuthStateChanged:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    console.log("[AuthContext] Tentando login para:", email);
    if (!auth || !auth.app) {
      throw new Error("O sistema de autenticação não foi configurado. Verifique as variáveis de ambiente.");
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      console.log("[AuthContext] Login bem-sucedido");
    } catch (error: any) {
      console.error("[AuthContext] Falha no login:", error.code, error.message);
      throw error;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!auth || !auth.app) {
      throw new Error("O sistema de autenticação não foi configurado. Verifique as variáveis de ambiente.");
    }
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);
    await syncProfile(firebaseUser, name);
  };

  const loginWithGoogle = async () => {
    if (!auth || !auth.app) {
      throw new Error("O sistema de autenticação não foi configurado. Verifique as variáveis de ambiente.");
    }
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
