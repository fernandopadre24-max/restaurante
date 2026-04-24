
"use client"

import { useState } from "react"
import { Sparkles, Loader2, Lightbulb, CupSoda, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { suggestSellingAssistant, type SuggestiveSellingAssistantOutput } from "@/ai/flows/suggestive-selling-assistant"

interface AISuggestionBoxProps {
  orderedItems: string[]
  popularItems: string[]
}

export function AISuggestionBox({ orderedItems, popularItems }: AISuggestionBoxProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<SuggestiveSellingAssistantOutput | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await suggestSellingAssistant({ orderedItems, popularItems })
      setSuggestion(result)
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            Assistente de Sugestões
          </CardTitle>
          <CardDescription>Otimize o ticket médio com IA</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerate} 
          disabled={loading || orderedItems.length === 0}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
          Sugerir Agora
        </Button>
      </CardHeader>
      <CardContent>
        {suggestion ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lightbulb className="h-4 w-4 text-accent" /> Pratos Complementares
                </h4>
                <div className="flex flex-wrap gap-1">
                  {suggestion.complementaryDishes.map((dish, i) => (
                    <Badge key={i} variant="secondary">{dish}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <CupSoda className="h-4 w-4 text-blue-500" /> Bebidas Ideais
                </h4>
                <div className="flex flex-wrap gap-1">
                  {suggestion.idealDrinks.map((drink, i) => (
                    <Badge key={i} variant="outline" className="bg-white">{drink}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white/50 p-3 rounded-lg border text-sm italic text-muted-foreground">
              <p>"{suggestion.reasoning}"</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary">Oportunidades de Upsell:</h4>
              <ul className="text-sm space-y-1">
                {suggestion.upsellOpportunities.map((opportunity, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                      Novo
                    </Badge>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">
              {orderedItems.length === 0 
                ? "Adicione itens ao pedido para receber sugestões inteligentes." 
                : "Clique no botão acima para analisar o pedido com IA."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
