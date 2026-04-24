
export type TableStatus = 'Livre' | 'Pendente' | 'Preparando' | 'Pronto' | 'Entregue'

export interface MenuItem {
  id: string | number
  name: string
  price: number
  category: string
  description: string
  popular: boolean
  accompaniments?: string[]
}

export interface Table {
  id: string | number
  name: string
  status: TableStatus
  total: number
  items: string[]
  waiter: string | null
  startTime?: string | null
}

export interface Employee {
  id: string;
  name: string;
  role: 'Gerente' | 'Garçom' | 'Cozinheiro';
  email: string;
  phone: string;
  status: 'Ativo' | 'Férias' | 'Inativo';
}
