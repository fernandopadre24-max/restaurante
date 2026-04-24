
"use client"

import { useState, useMemo } from "react"
import { 
  Plus, 
  Minus,
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  DollarSign,
  UserCheck,
  Lock,
  LogOut,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft,
  LayoutGrid,
  UserRound,
  ListPlus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AISuggestionBox } from "@/components/AISuggestionBox"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRestaurant } from "@/context/RestaurantContext"
import { TableStatus } from "@/types/restaurant"


export default function MesasPage() {
  const { tables, menuItems, employees, updateTableStatus, addItemsToTable, removeItemFromTable, openTable, closeTable } = useRestaurant()
  const [selectedTableId, setSelectedTableId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStaffAuthOpen, setIsStaffAuthOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [pendingTableId, setPendingTableId] = useState<string | number | null>(null)
  const [staffInput, setStaffInput] = useState("")
  const [pendingItems, setPendingItems] = useState<Record<string, number>>({})
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [cashReceived, setCashReceived] = useState<string>("")
  const { toast } = useToast()


  const selectedTable = useMemo(() => 
    tables.find(t => t.id === selectedTableId) || null, 
  [tables, selectedTableId])

  const troco = useMemo(() => {
    if (paymentMethod !== 'cash') return 0
    const received = parseFloat(cashReceived) || 0
    const total = selectedTable?.total || 0
    return Math.max(0, Number((received - total).toFixed(2)))
  }, [paymentMethod, cashReceived, selectedTable?.total])

  const canFinalize = useMemo(() => {
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived) || 0
      return received >= (selectedTable?.total || 0)
    }
    return true
  }, [paymentMethod, cashReceived, selectedTable?.total])

  const handleTableClick = (id: string | number) => {
    const table = tables.find(t => t.id === id)
    if (table && table.status === 'Livre') {
      setPendingTableId(id)
      setStaffInput("")
      setIsStaffAuthOpen(true)
    } else {
      setSelectedTableId(id)
    }
  }


  const handleStaffConfirm = async () => {
    const selectedStaff = employees.find(s => s.name === staffInput)
    if (!selectedStaff || selectedStaff.role === 'Cozinheiro') {
      toast({
        title: "Acesso Negado",
        description: "Apenas Garçons ou Gerentes podem abrir mesas.",
        variant: "destructive",
      })
      return
    }

    if (pendingTableId !== null) {
      await openTable(pendingTableId, staffInput)
      setSelectedTableId(pendingTableId)
    }
    setIsStaffAuthOpen(false)
    setPendingTableId(null)
  }


  const handleUpdateStatus = async (newStatus: TableStatus) => {
    if (!selectedTableId) return
    await updateTableStatus(selectedTableId, newStatus)
    toast({
      title: "Status Atualizado",
      description: `Mesa ${selectedTableId} agora está ${newStatus}.`,
    })
  }


  const handleFinalizePayment = async () => {
    if (!selectedTableId || !canFinalize) return
    const methodNames: Record<string, string> = {
      credit: "Crédito",
      debit: "Débito",
      pix: "PIX",
      cash: "Dinheiro"
    }
    
    await closeTable(selectedTableId)
    toast({
      title: "Pagamento Confirmado",
      description: `Mesa finalizada com ${methodNames[paymentMethod]}. ${paymentMethod === 'cash' ? `Troco: R$ ${troco.toFixed(2)}` : ''}`,
    })
    setIsCheckoutOpen(false)
    setSelectedTableId(null)
    setCashReceived("")
  }


  const handleUpdatePendingQty = (itemName: string, delta: number) => {
    setPendingItems(prev => {
      const current = prev[itemName] || 0
      const next = current + delta
      if (next <= 0) {
        const newState = { ...prev }
        delete newState[itemName]
        return newState
      }
      return { ...prev, [itemName]: next }
    })
  }

  const handleConfirmItems = async () => {
    if (!selectedTableId) return
    const itemEntries = Object.entries(pendingItems)
    let totalAdded = 0
    const itemsStrings = itemEntries.map(([name, qty]) => {
      const item = menuItems.find(mi => mi.name === name)
      totalAdded += (item?.price || 0) * qty
      return `${qty}x ${name}`
    })

    await addItemsToTable(selectedTableId, itemsStrings, totalAdded)
    setPendingItems({})
    setIsDialogOpen(false)
    toast({ title: "Itens Adicionados" })
  }


  const handleRemoveItem = async (index: number) => {
    if (!selectedTable || !selectedTableId) return
    const removedItemString = selectedTable.items[index]
    let priceToSubtract = 0
    const match = removedItemString.match(/(\d+)x (.*)/)
    if (match) {
      const qty = parseInt(match[1])
      const name = match[2].trim()
      const menuItem = menuItems.find(mi => mi.name === name)
      if (menuItem) priceToSubtract = menuItem.price * qty
    }
    await removeItemFromTable(selectedTableId, index, priceToSubtract)
  }


  const filteredTables = tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (!selectedTableId || !selectedTable) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mapa do Salão</h1>
            <p className="text-muted-foreground">Sincronizado com a cozinha em tempo real.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Buscar mesa..." 
              className="pl-9 h-12 w-full text-lg rounded-md border border-input bg-background px-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => (
            <Card 
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`cursor-pointer transition-all border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                table.status === 'Livre' ? 'border-green-100 bg-white' : 
                table.status === 'Pendente' ? 'border-orange-200 bg-orange-50/10' :
                table.status === 'Preparando' ? 'border-primary/20 bg-primary/5' :
                table.status === 'Pronto' ? 'border-green-400 bg-green-50/30 animate-pulse' : 
                'border-blue-200 bg-blue-50/10'
              }`}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className={`p-3 rounded-2xl ${
                  table.status === 'Livre' ? 'bg-green-50 text-green-600' : 
                  table.status === 'Pronto' ? 'bg-green-100 text-green-700' :
                  'bg-primary/10 text-primary'
                }`}>
                  <Utensils className="h-8 w-8" />
                </div>
                <span className="font-bold text-xl">{table.name}</span>
                <Badge variant={table.status === 'Livre' ? 'outline' : 'default'} className={
                  table.status === 'Livre' ? 'text-green-600 border-green-200' : 
                  table.status === 'Pronto' ? 'bg-green-600' : 
                  table.status === 'Entregue' ? 'bg-blue-600' : ''
                }>
                  {table.status.toUpperCase()}
                </Badge>
                {table.items.length > 0 && (
                  <div className="w-full text-left text-[11px] text-muted-foreground border-t pt-2 mt-1">
                    {table.items.slice(0, 2).map((it, idx) => <p key={idx} className="truncate">• {it}</p>)}
                    {table.items.length > 2 && <p className="font-bold">+ {table.items.length - 2} itens</p>}
                  </div>
                )}
                {table.total > 0 && (
                  <div className="pt-2 border-t w-full flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Subtotal:</span>
                    <span className="text-sm font-black">R$ {table.total.toFixed(2)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isStaffAuthOpen} onOpenChange={setIsStaffAuthOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Identificação</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              {employees.map((staff) => (
                <Button
                  key={staff.id}
                  variant={staffInput === staff.name ? "default" : "outline"}
                  className="w-full h-14 justify-between"
                  onClick={() => setStaffInput(staff.name)}
                >
                  <div className="flex items-center"><UserRound className="h-5 w-5 mr-3" /> {staff.name}</div>
                  <Badge variant="secondary">{staff.role}</Badge>
                </Button>
              ))}
            </div>
            <Button className="w-full h-12" onClick={handleStaffConfirm} disabled={!staffInput}>CONFIRMAR</Button>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedTableId(null)} className="h-12 w-12 rounded-full"><ArrowLeft /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">{selectedTable.name}</h1>
              <Badge variant="outline" className="text-lg px-4">{selectedTable.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <UserCheck className="h-4 w-4" /> Atendente: <strong>{selectedTable.waiter}</strong>
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          {selectedTable.status === 'Pronto' && (
            <Button onClick={() => handleUpdateStatus('Entregue')} className="bg-blue-600 hover:bg-blue-700 font-bold">
              <CheckCircle2 className="h-5 w-5 mr-2" /> MARCAR COMO ENTREGUE
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsCheckoutOpen(true)} className="border-primary text-primary font-bold">
            <DollarSign className="h-5 w-5 mr-2" /> FECHAR CONTA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-xl font-bold">Pedidos da Mesa</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedTable.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedTable.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Badge className="h-8 w-8 rounded-lg">{item.split('x')[0]}</Badge>
                        <span className="font-bold">{item.split('x')[1].trim()}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(i)}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t-2 border-dashed flex justify-between items-center">
                    <span className="text-xl font-bold text-muted-foreground">Total</span>
                    <span className="text-4xl font-black text-primary">R$ {selectedTable.total.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  <p>Abra o menu abaixo para lançar itens.</p>
                </div>
              )}
              <Button size="lg" className="w-full h-16 text-xl font-bold mt-8" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-6 w-6 mr-2" /> LANÇAR ITENS
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AISuggestionBox orderedItems={selectedTable.items} popularItems={menuItems.map(i => i.name)} />
          <Button variant="outline" onClick={() => setSelectedTableId(null)} className="w-full h-14 font-bold">
            <LayoutGrid className="h-5 w-5 mr-2" /> MAPA DO SALÃO
          </Button>
          {selectedTable.items.length === 0 && (
            <Button variant="ghost" onClick={async () => { await closeTable(selectedTableId!); setSelectedTableId(null); }} className="w-full h-14 text-destructive hover:bg-destructive/5 font-bold">
              <LogOut className="h-5 w-5 mr-2" /> CANCELAR ATENDIMENTO
            </Button>
          )}

        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Menu de Pedidos</DialogTitle></DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {menuItems.map(item => (
              <div key={item.name} className="p-4 border-2 rounded-2xl mb-2 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-black">{item.name}</p>
                    <p className="text-sm text-primary font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-xl">
                    <Button variant="ghost" size="icon" onClick={() => handleUpdatePendingQty(item.name, -1)} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                    <span className="font-black text-sm">{pendingItems[item.name] || 0}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleUpdatePendingQty(item.name, 1)} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                  </div>
                </div>
                {item.accompaniments && item.accompaniments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <ListPlus className="h-3 w-3 text-muted-foreground mr-1" />
                    {item.accompaniments.map((acc, i) => (
                      <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0 font-normal opacity-70">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
          <Button className="w-full h-14 text-xl font-black" onClick={handleConfirmItems}>CONFIRMAR</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Fechamento de Conta</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Label htmlFor="credit" className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'}`}>
                <RadioGroupItem value="credit" id="credit" className="sr-only" />
                <CreditCard className="mb-2 h-8 w-8 text-primary" /><span className="text-[10px] font-bold uppercase">Crédito</span>
              </Label>
              <Label htmlFor="debit" className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${paymentMethod === 'debit' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'}`}>
                <RadioGroupItem value="debit" id="debit" className="sr-only" />
                <CreditCard className="mb-2 h-8 w-8 text-blue-500" /><span className="text-[10px] font-bold uppercase">Débito</span>
              </Label>
              <Label htmlFor="pix" className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'}`}>
                <RadioGroupItem value="pix" id="pix" className="sr-only" />
                <QrCode className="mb-2 h-8 w-8 text-accent" /><span className="text-[10px] font-bold uppercase">PIX</span>
              </Label>
              <Label htmlFor="cash" className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'}`}>
                <RadioGroupItem value="cash" id="cash" className="sr-only" />
                <Banknote className="mb-2 h-8 w-8 text-green-600" /><span className="text-[10px] font-bold uppercase">Dinheiro</span>
              </Label>
            </RadioGroup>
            
            {paymentMethod === 'cash' && (
              <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Valor Recebido</Label>
                  {parseFloat(cashReceived) < selectedTable.total && cashReceived !== "" && (
                    <Badge variant="destructive" className="animate-bounce">VALOR INSUFICIENTE</Badge>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00"
                    value={cashReceived} 
                    onChange={e => setCashReceived(e.target.value)} 
                    className="h-14 pl-10 text-2xl font-black text-primary" 
                  />
                </div>
                {parseFloat(cashReceived) >= selectedTable.total && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border-2 border-dashed border-primary/30">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Troco a devolver:</span>
                    <span className="text-2xl font-black text-primary">R$ {troco.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-primary p-6 rounded-2xl flex justify-between items-center text-white shadow-lg">
              <div className="flex flex-col">
                <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">Total da Conta</span>
                <span className="font-medium text-sm">Mesa: {selectedTable.name}</span>
              </div>
              <span className="text-4xl font-black">R$ {selectedTable.total.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full h-16 text-xl font-black shadow-xl" 
            onClick={handleFinalizePayment} 
            disabled={!canFinalize}
          >
            CONFIRMAR PAGAMENTO
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
