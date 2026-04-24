
"use client"

import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Utensils,
  Truck,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/context/RestaurantContext"

export default function Home() {
  const { tables } = useRestaurant()
  const [expandedId, setExpandedId] = useState<string | number | null>(null)


  const activeTables = tables.filter(t => t.status !== 'Livre')
  const deliveredCount = tables.filter(t => t.status === 'Entregue').length
  const pendingCount = tables.filter(t => t.status === 'Pendente' || t.status === 'Preparando').length
  
  const totalSales = tables.reduce((acc, t) => acc + (t.status === 'Livre' ? 0 : t.total), 4250) // Mock base + total atual

  const stats = [
    { label: "Vendas Hoje", value: `R$ ${totalSales.toFixed(0)}`, icon: TrendingUp, color: "text-primary" },
    { label: "Mesas Ocupadas", value: activeTables.length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Em Produção", value: pendingCount.toString(), icon: ShoppingBag, color: "text-orange-500" },
    { label: "Servidos", value: deliveredCount.toString(), icon: Truck, color: "text-blue-500" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground">Resumo em tempo real da operação do restaurante.</p>
        </div>
        <Link href="/mesas">
          <Button className="bg-primary hover:bg-primary/90">Novo Pedido</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Operação no Salão</CardTitle>
            <Link href="/mesas">
              <Button variant="ghost" size="sm" className="text-primary">Ver Tudo <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {activeTables.map((table) => {
                const isExpanded = expandedId === table.id
                return (
                  <div key={table.id} className="hover:bg-muted/30">
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : table.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {table.id}
                        </div>
                        <div>
                          <p className="font-bold">{table.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" /> {table.waiter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={cn(
                          table.status === 'Pendente' ? 'bg-orange-500' : 
                          table.status === 'Pronto' ? 'bg-green-600' : 
                          table.status === 'Entregue' ? 'bg-blue-600' : 'bg-primary'
                        )}>
                          {table.status}
                        </Badge>
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="p-4 bg-muted/20 animate-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-2">
                          {table.items.map((it, idx) => (
                            <div key={idx} className="bg-white p-2 border rounded-lg text-sm font-medium">
                              {it}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {activeTables.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">Sem mesas ocupadas no momento.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5 h-fit">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center gap-2">Alertas de Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             <div className="p-3 bg-white rounded-lg border border-orange-100">
               <p className="text-sm font-bold">Farinha de Trigo</p>
               <p className="text-xs text-muted-foreground">Crítico: 2kg restantes</p>
             </div>
             <Link href="/estoque">
                <Button variant="outline" className="w-full mt-2 border-primary text-primary">Gerenciar Estoque</Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
