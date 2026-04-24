
"use client"

import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  MoreHorizontal,
  BadgeCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

const staff = [
  { id: 1, name: "Ricardo Almeida", role: "Gerente", email: "ricardo@chefpro.com", phone: "(11) 98765-4321", status: "Ativo" },
  { id: 2, name: "Juliana Silva", role: "Garçom", email: "juliana@chefpro.com", phone: "(11) 91234-5678", status: "Ativo" },
  { id: 3, name: "Marcos Oliveira", role: "Cozinheiro", email: "marcos@chefpro.com", phone: "(11) 95555-4444", status: "Ativo" },
  { id: 4, name: "Ana Beatriz", role: "Garçom", email: "ana@chefpro.com", phone: "(11) 94444-3333", status: "Férias" },
  { id: 5, name: "Sérgio Mendes", role: "Garçom", email: "sergio@chefpro.com", phone: "(11) 92222-1111", status: "Ativo" },
]

export default function FuncionariosPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Funcionários</h1>
          <p className="text-muted-foreground">Gerencie sua equipe e níveis de acesso.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Novo Funcionário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((person) => (
          <Card key={person.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              person.role === 'Gerente' ? 'bg-primary' : 'bg-accent'
            }`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{person.name}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className={`h-3 w-3 ${person.role === 'Gerente' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <CardDescription>{person.role}</CardDescription>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Alterar Permissões</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Desativar Acesso</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{person.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{person.phone}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge variant={person.status === 'Ativo' ? 'default' : 'secondary'} className={
                  person.status === 'Ativo' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : ''
                }>
                  {person.status}
                </Badge>
                {person.role === 'Gerente' && (
                  <Badge className="bg-primary text-white flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" /> Acesso Total
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30 border-dashed border-2">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Construa sua Equipe de Sucesso</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Atribua perfis de acesso específicos para Gerentes e Garçons para garantir que cada um veja apenas o necessário para sua função.
          </p>
          <Button className="mt-6 border-primary text-primary hover:bg-primary hover:text-white" variant="outline">
            Ver Tutorial de Permissões
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
