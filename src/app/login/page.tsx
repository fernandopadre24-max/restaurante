
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Lock, Mail, Loader2, User as UserIcon, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login, register, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
      case 'auth/user-not-found': return 'Usuário não encontrado.';
      case 'auth/wrong-password': return 'Senha incorreta.';
      case 'auth/email-already-in-use': return 'Este e-mail já está sendo usado.';
      case 'auth/weak-password': return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/invalid-email': return 'E-mail inválido.';
      case 'auth/operation-not-allowed': return 'Este método de login não está ativado no Firebase.';
      case 'auth/popup-blocked': return 'O pop-up de login foi bloqueado pelo navegador.';
      case 'auth/cancelled-popup-request': return 'O login foi cancelado.';
      default: return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    console.log("[LoginPage] Iniciando submissão do formulário. Modo:", isRegistering ? "Registro" : "Login");
    
    try {
      if (isRegistering) {
        await register(name, email, password)
        toast({ title: "Conta criada!", description: "Bem-vindo ao ChefPro!" })
      } else {
        await login(email, password)
        toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." })
      }
      console.log("[LoginPage] Autenticação bem-sucedida, redirecionando para /...");
      router.push("/")
    } catch (err: any) {
      console.error("[LoginPage] Erro na autenticação:", err)
      const friendlyMessage = getFriendlyErrorMessage(err.code);
      setError(`${friendlyMessage} (${err.code})`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    setError(null)
    console.log("[LoginPage] Iniciando login com Google...");
    try {
      await loginWithGoogle()
      toast({ title: "Bem-vindo!", description: "Login com Google realizado com sucesso." })
      console.log("[LoginPage] Google login bem-sucedido, redirecionando...");
      router.push("/")
    } catch (err: any) {
      console.error("[LoginPage] Erro no login Google:", err)
      const friendlyMessage = getFriendlyErrorMessage(err.code);
      setError(`${friendlyMessage} (${err.code})`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F2] p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-5" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative z-10 border-none shadow-2xl backdrop-blur-sm bg-white/90">
        <CardHeader className="space-y-4 flex flex-col items-center pb-2">
          <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-500 transform hover:rotate-12">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">ChefPro</CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">
              {isRegistering ? "Crie sua conta administrativa" : "Gestão Inteligente de Restaurantes"}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in zoom-in duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nome Completo</Label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="name" 
                    placeholder="Como deseja ser chamado" 
                    className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">E-mail Corporativo</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Senha" className="text-sm font-bold text-slate-700">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-primary focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button 
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isRegistering ? "PROCESSANDO..." : "AUTENTICANDO..."}
                </>
              ) : (
                isRegistering ? "CRIAR CONTA AGORA" : "ENTRAR NO PAINEL"
              )}
            </Button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-all underline-offset-4 hover:underline"
              >
                {isRegistering ? "Já possui acesso? Clique aqui" : "Novo por aqui? Solicite sua conta"}
              </button>
            </div>

            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/90 px-3 text-slate-400 font-bold tracking-widest">OU</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 text-base font-bold border-2 hover:bg-slate-50 transition-all group"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              <svg className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              ACESSAR COM GOOGLE
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
