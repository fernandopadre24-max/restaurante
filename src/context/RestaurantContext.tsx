
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  subscribeToTables, 
  subscribeToMenuItems, 
  subscribeToEmployees,
  updateTable, 
  openTableFirestore, 
  closeTableFirestore, 
  addMenuItemFirestore, 
  updateMenuItemFirestore, 
  removeMenuItemFirestore,
  addEmployeeFirestore,
  updateEmployeeFirestore,
  removeEmployeeFirestore,
  seedDatabase
} from '@/lib/firestore'
import { Table, MenuItem, Employee, TableStatus } from "@/types/restaurant"


interface RestaurantContextType {
  tables: Table[]
  menuItems: MenuItem[]
  employees: Employee[]
  updateTableStatus: (id: string | number, status: TableStatus) => Promise<void>
  addItemsToTable: (id: string | number, newItems: string[], totalAdded: number) => Promise<void>
  removeItemFromTable: (id: string | number, itemIndex: number, priceToSubtract: number) => Promise<void>
  openTable: (id: string | number, waiter: string) => Promise<void>
  closeTable: (id: string | number) => Promise<void>
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>
  updateMenuItem: (id: string | number, item: Partial<Omit<MenuItem, 'id'>>) => Promise<void>
  removeMenuItem: (id: string | number) => Promise<void>
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>
  removeEmployee: (id: string) => Promise<void>
}


const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined)

const INITIAL_MENU: MenuItem[] = [
  { id: 1, name: "Burger Gourmet", price: 42.90, category: "Principais", description: "Blend 180g, queijo cheddar, bacon, cebola caramelizada e maionese artesanal.", popular: true, accompaniments: ["Batata Frita", "Maionese de Ervas"] },
  { id: 2, name: "Risoto de Funghi", price: 58.00, category: "Principais", description: "Arroz arbóreo, mix de cogumelos, vinho branco e parmesão.", popular: true, accompaniments: ["Salada Mix", "Pão Italiano"] },
  { id: 3, name: "Pizza Marguerita", price: 45.00, category: "Pizzas", description: "Molho de tomate pelado, mussarela de búfala e manjericão fresco.", popular: false, accompaniments: ["Azeite Trufado"] },
  { id: 4, name: "Petit Gâteau", price: 28.50, category: "Sobremesas", description: "Bolinho de chocolate meio amargo servido com sorvete de creme.", popular: true, accompaniments: ["Caldas de Frutas Vermelhas"] },
  { id: 5, name: "Suco de Laranja", price: 12.00, category: "Bebidas", description: "Suco natural feito na hora.", popular: false },
  { id: 6, name: "Vinho da Casa", price: 85.00, category: "Bebidas", description: "Vinho tinto seco, seleção especial do sommelier.", popular: true },
]

const INITIAL_TABLES: Table[] = [
  { id: 1, name: "Mesa 01", status: "Livre", total: 0, items: [], waiter: null },
  { id: 2, name: "Mesa 02", status: "Livre", total: 0, items: [], waiter: null },
  { id: 3, name: "Mesa 03", status: "Livre", total: 0, items: [], waiter: null },
  { id: 4, name: "Mesa 04", status: "Entregue", total: 45.00, items: ["1x Pizza Marguerita"], waiter: "Juliana Silva", startTime: "14:10" },
  { id: 5, name: "Mesa 05", status: "Preparando", total: 97.80, items: ["2x Burger Gourmet", "1x Suco de Laranja"], waiter: "Ricardo Almeida", startTime: "14:25" },
  { id: 6, name: "Mesa 06", status: "Livre", total: 0, items: [], waiter: null },
  { id: 7, name: "Mesa 07", status: "Livre", total: 0, items: [], waiter: null },
  { id: 8, name: "Mesa 08", status: "Pendente", total: 40.50, items: ["1x Petit Gâteau", "1x Suco de Laranja"], waiter: "Sérgio Mendes", startTime: "14:40" },
]

const INITIAL_EMPLOYEES: Omit<Employee, 'id'>[] = [
  { name: "Ricardo Almeida", role: "Gerente", email: "ricardo@chefpro.com", phone: "(11) 98765-4321", status: "Ativo" },
  { name: "Juliana Silva", role: "Garçom", email: "juliana@chefpro.com", phone: "(11) 91234-5678", status: "Ativo" },
  { name: "Marcos Oliveira", role: "Cozinheiro", email: "marcos@chefpro.com", phone: "(11) 95555-4444", status: "Ativo" },
  { name: "Sérgio Mendes", role: "Garçom", email: "sergio@chefpro.com", phone: "(11) 92222-1111", status: "Ativo" },
]

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    // Initial seed if needed
    seedDatabase(INITIAL_TABLES, INITIAL_MENU, INITIAL_EMPLOYEES);

    // Subscriptions
    const unsubscribeTables = subscribeToTables(setTables);
    const unsubscribeMenu = subscribeToMenuItems(setMenuItems);
    const unsubscribeEmployees = subscribeToEmployees(setEmployees);

    return () => {
      unsubscribeTables();
      unsubscribeMenu();
      unsubscribeEmployees();
    };
  }, []);

  const updateTableStatus = async (id: string | number, status: TableStatus) => {
    await updateTable(id, { status });
  }

  const openTable = async (id: string | number, waiter: string) => {
    await openTableFirestore(id, waiter);
  }

  const addItemsToTable = async (id: string | number, newItems: string[], totalAdded: number) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      await updateTable(id, {
        items: [...table.items, ...newItems],
        total: Number((table.total + totalAdded).toFixed(2)),
        status: table.status === 'Livre' ? 'Pendente' : table.status
      });
    }
  }

  const removeItemFromTable = async (id: string | number, itemIndex: number, priceToSubtract: number) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      const newItems = [...table.items];
      newItems.splice(itemIndex, 1);
      await updateTable(id, {
        items: newItems,
        total: Number((Math.max(0, table.total - priceToSubtract)).toFixed(2))
      });
    }
  }

  const closeTable = async (id: string | number) => {
    await closeTableFirestore(id);
  }

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    await addMenuItemFirestore(item);
  }

  const updateMenuItem = async (id: string | number, updatedFields: Partial<Omit<MenuItem, 'id'>>) => {
    await updateMenuItemFirestore(id, updatedFields);
  }

  const removeMenuItem = async (id: string | number) => {
    await removeMenuItemFirestore(id);
  }

  const addEmployee = async (emp: Omit<Employee, 'id'>) => {
    await addEmployeeFirestore(emp);
  }

  const updateEmployee = async (id: string, emp: Partial<Employee>) => {
    await updateEmployeeFirestore(id, emp);
  }

  const removeEmployee = async (id: string) => {
    await removeEmployeeFirestore(id);
  }

  return (
    <RestaurantContext.Provider value={{ 
      tables, 
      menuItems,
      employees,
      updateTableStatus, 
      addItemsToTable, 
      removeItemFromTable, 
      openTable, 
      closeTable,
      addMenuItem,
      updateMenuItem,
      removeMenuItem,
      addEmployee,
      updateEmployee,
      removeEmployee
    }}>
      {children}
    </RestaurantContext.Provider>
  )
}


export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider')
  }
  return context
}
