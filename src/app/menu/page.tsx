
"use client"

import { useState } from "react"
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  Star,
  ListPlus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRestaurant, MenuItem } from "@/context/RestaurantContext"
import { useToast } from "@/hooks/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function MenuPage() {
  const { menuItems, addMenuItem, removeMenuItem, updateMenuItem } = useRestaurant()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  
  // Form State
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newCategory, setNewCategory] = useState("Principais")
  const [newDescription, setNewDescription] = useState("")
  const [newPopular, setNewPopular] = useState(false)
  const [newAccompaniments, setNewAccompaniments] = useState("")

  const handleOpenAddDialog = () => {
    setEditingItem(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setNewName(item.name)
    setNewPrice(item.price.toString())
    setNewCategory(item.category)
    setNewDescription(item.description)
    setNewPopular(item.popular)
    setNewAccompaniments(item.accompaniments?.join(", ") || "")
    setIsDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!newName || !newPrice) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios.", variant: "destructive" })
      return
    }

    const accompanimentsArray = newAccompaniments
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "")

    const itemData = {
      name: newName,
      price: parseFloat(newPrice),
      category: newCategory,
      description: newDescription,
      popular: newPopular,
      accompaniments: accompanimentsArray.length > 0 ? accompanimentsArray : undefined
    }

    if (editingItem) {
      await updateMenuItem(editingItem.id, itemData)
      toast({ title: "Sucesso", description: `${newName} foi atualizado.` })
    } else {
      await addMenuItem(itemData)
      toast({ title: "Sucesso", description: `${newName} foi adicionado ao cardápio.` })
    }

    setIsDialogOpen(false)
    resetForm()
  }


  const resetForm = () => {
    setNewName("")
    setNewPrice("")
    setNewCategory("Principais")
    setNewDescription("")
    setNewPopular(false)
    setNewAccompaniments("")
    setEditingItem(null)
  }

  const handleDeleteItem = async (id: string | number, name: string) => {
    await removeMenuItem(id)
    toast({ title: "Removido", description: `${name} foi removido do cardápio.` })
  }


  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cardápio Digital</h1>
          <p className="text-muted-foreground">Gerencie pratos, acompanhamentos e disponibilidade.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenAddDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Novo Prato
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Prato' : 'Cadastrar Novo Prato'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Prato</Label>
                  <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Risoto de Alho Poró" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0,00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Principais">Principais</SelectItem>
                        <SelectItem value="Entradas">Entradas</SelectItem>
                        <SelectItem value="Pizzas">Pizzas</SelectItem>
                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                        <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="accompaniments">Acompanhamentos (Separados por vírgula)</Label>
                  <Input 
                    id="accompaniments" 
                    value={newAccompaniments} 
                    onChange={(e) => setNewAccompaniments(e.target.value)} 
                    placeholder="Ex: Arroz branco, Batata frita, Farofa" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Detalhes do prato..." />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Label className="text-base">Prato Popular</Label>
                    <p className="text-xs text-muted-foreground">Destaque este item como 'Mais Pedido'.</p>
                  </div>
                  <Switch checked={newPopular} onCheckedChange={setNewPopular} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveItem}>{editingItem ? 'Salvar Alterações' : 'Salvar no Cardápio'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setCategoryFilter}>
          <TabsList className="bg-white border p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg">Todos</TabsTrigger>
            <TabsTrigger value="Principais" className="rounded-lg">Principais</TabsTrigger>
            <TabsTrigger value="Bebidas" className="rounded-lg">Bebidas</TabsTrigger>
            <TabsTrigger value="Sobremesas" className="rounded-lg">Sobremesas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar no cardápio..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
            <div className="h-40 bg-muted flex items-center justify-center relative">
              <ImageIcon className="h-10 w-10 text-muted-foreground opacity-30" />
              {item.popular && (
                <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground flex items-center gap-1 border-none">
                  <Star className="h-3 w-3 fill-current" /> Mais Pedido
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" className="h-9" onClick={() => handleOpenEditDialog(item)}>
                  <Edit3 className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" className="h-9" onClick={() => handleDeleteItem(item.id, item.name)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remover
                </Button>
              </div>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <span className="font-bold text-primary">R$ {item.price.toFixed(2)}</span>
              </div>
              <CardDescription className="line-clamp-2 h-10">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              {item.accompaniments && item.accompaniments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ListPlus className="h-3 w-3" /> Acompanhamentos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.accompaniments.map((acc, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                        {acc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 border-t mt-auto">
              <div className="flex items-center gap-2 w-full">
                <Badge variant="outline" className="flex items-center gap-1 font-normal text-muted-foreground text-[10px]">
                  <Tag className="h-3 w-3" /> {item.category}
                </Badge>
                <div className="ml-auto flex items-center gap-2">
                   <span className="text-xs text-muted-foreground">Status:</span>
                   <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Ativo</Badge>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
