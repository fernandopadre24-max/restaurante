
"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F2]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Carregando ChefPro...</p>
        </div>
      </div>
    )
  }

  // Se estiver na tela de login e já estiver logado, redireciona para home
  if (user && pathname === "/login") {
    router.push("/")
    return null
  }

  // Se não estiver logado e não estiver na tela de login, não mostra nada enquanto redireciona
  if (!user && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
