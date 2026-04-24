
"use client"

import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Timer,
  PlayCircle,
  Truck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRestaurant, TableStatus } from "@/context/RestaurantContext"
import { cn } from "@/lib/utils"

export default function CozinhaPage() {
  const { tables, updateTableStatus } = useRestaurant()
  const { toast } = useToast()

  // Filtra mesas que têm pedidos ativos
  const activeOrders = tables.filter(t => t.status !== 'Livre')

  const handleUpdateStatus = async (id: string | number, newStatus: TableStatus) => {
    await updateTableStatus(id, newStatus)
    const messages: Record<string, string> = {
      Preparando: "Preparo iniciado.",
      Pronto: "Pedido pronto para entrega!",
      Entregue: "Pedido saiu para a mesa."
    }
    toast({ title: "Cozinha", description: messages[newStatus] || "Status atualizado." })
  }


  const filteredOrders = (status: string) => {
    if (status === 'all') return activeOrders
    return activeOrders.filter(o => o.status === status)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard da Cozinha</h1>
          <p className="text-muted-foreground">Sincronizado com o salão em tempo real.</p>
        </div>
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm">
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase">Pendentes</p>
            <p className="text-2xl font-black text-orange-500">{activeOrders.filter(o => o.status === 'Pendente').length}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase">Em Preparo</p>
            <p className="text-2xl font-black text-primary">{activeOrders.filter(o => o.status === 'Preparando').length}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="Pendente" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl mb-6">
          <TabsTrigger value="Pendente" className="rounded-lg">Pendentes</TabsTrigger>
          <TabsTrigger value="Preparando" className="rounded-lg">Em Preparo</TabsTrigger>
          <TabsTrigger value="Pronto" className="rounded-lg">Prontos</TabsTrigger>
          <TabsTrigger value="Entregue" className="rounded-lg">Entregues</TabsTrigger>
        </TabsList>

        {['Pendente', 'Preparando', 'Pronto', 'Entregue'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOrders(tab).map((order) => (
                <Card key={order.id} className="border-none shadow-sm flex flex-col">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between">
                      <Badge variant="outline">{order.startTime || '--:--'}</Badge>
                      <Badge className={cn(
                        order.status === 'Pendente' ? 'bg-orange-500' : 
                        order.status === 'Preparando' ? 'bg-primary' : 
                        order.status === 'Pronto' ? 'bg-green-600' : 'bg-blue-600'
                      )}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mt-2">{order.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1">
                    <ul className="space-y-3">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex gap-2 font-bold">
                          <Badge variant="secondary" className="h-6">{item.split('x')[0]}x</Badge>
                          <span>{item.split('x')[1]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-4 bg-muted/30 border-t flex gap-2">
                    {order.status === 'Pendente' && (
                      <Button onClick={() => handleUpdateStatus(order.id, 'Preparando')} className="flex-1 font-bold">
                        <PlayCircle className="h-4 w-4 mr-2" /> INICIAR
                      </Button>
                    )}
                    {order.status === 'Preparando' && (
                      <Button onClick={() => handleUpdateStatus(order.id, 'Pronto')} className="flex-1 bg-green-600 font-bold">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> PRONTO
                      </Button>
                    )}
                    {order.status === 'Pronto' && (
                      <Button onClick={() => handleUpdateStatus(order.id, 'Entregue')} className="flex-1 bg-blue-600 font-bold">
                        <Truck className="h-4 w-4 mr-2" /> ENTREGAR
                      </Button>
                    )}
                    {order.status === 'Entregue' && (
                      <Button disabled className="flex-1 opacity-50 font-bold">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> ENTREGUE
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              {filteredOrders(tab).length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <ChefHat className="h-12 w-12 mb-4 opacity-20" />
                  <p>Sem pedidos para {tab.toLowerCase()}.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
