
"use client"

import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  History,
  MoreVertical
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

const inventory = [
  { id: 1, name: "Carne Bovina (Fraldinha)", category: "Proteína", stock: "15 kg", min: "20 kg", status: "baixo" },
  { id: 2, name: "Pão de Burger Brioche", category: "Padaria", stock: "120 unid", min: "50 unid", status: "ok" },
  { id: 3, name: "Queijo Cheddar Fatiado", category: "Laticínios", stock: "45 kg", min: "10 kg", status: "ok" },
  { id: 4, name: "Farinha de Trigo", category: "Secos", stock: "5 kg", min: "20 kg", status: "critico" },
  { id: 5, name: "Batata Congelada", category: "Congelados", stock: "50 kg", min: "30 kg", status: "ok" },
  { id: 6, name: "Coca-Cola 350ml", category: "Bebidas", stock: "240 unid", min: "100 unid", status: "ok" },
]

export default function EstoquePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Controle seus insumos e evite rupturas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><History className="h-4 w-4 mr-2" /> Histórico</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Entrada de Insumo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-destructive/5 text-destructive">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-xl">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Itens Críticos</p>
              <h3 className="text-2xl font-black">03</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-accent/10 text-accent-foreground">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-xl">
              <TrendingDown className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Abaixo do Mínimo</p>
              <h3 className="text-2xl font-black">08</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary/5 text-primary">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider">Total de Insumos</p>
              <h3 className="text-2xl font-black">154</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar insumo ou categoria..." className="pl-9" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">Proteína</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">Bebidas</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent/10">Secos</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Insumo</TableHead>
                <TableHead className="font-bold">Categoria</TableHead>
                <TableHead className="font-bold text-right">Estoque Atual</TableHead>
                <TableHead className="font-bold text-right">Mínimo</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">{item.stock}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.min}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={
                      item.status === 'critico' ? 'bg-destructive' : 
                      item.status === 'baixo' ? 'bg-orange-500' : 'bg-primary'
                    }>
                      {item.status === 'critico' ? 'CRÍTICO' : item.status === 'baixo' ? 'BAIXO' : 'OK'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
