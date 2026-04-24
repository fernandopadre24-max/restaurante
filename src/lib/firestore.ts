import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Table, MenuItem, Employee } from "@/types/restaurant";

const TABLES_COLLECTION = "tables";
const MENU_COLLECTION = "menuItems";
const EMPLOYEES_COLLECTION = "employees";

// --- Tables Service ---

export const getTables = async (): Promise<Table[]> => {
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, TABLES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Table));
};

export const subscribeToTables = (callback: (tables: Table[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, TABLES_COLLECTION));
  return onSnapshot(q, (querySnapshot) => {
    const tables = querySnapshot.docs.map(doc => ({ 
      ...doc.data(),
      id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id) 
    } as unknown as Table));
    callback(tables);
  });
};

export const updateTable = async (id: string | number, data: Partial<Table>) => {
  if (!db) return;
  const tableRef = doc(db, TABLES_COLLECTION, String(id));
  await updateDoc(tableRef, data);
};

export const openTableFirestore = async (id: string | number, waiter: string) => {
  if (!db) return;
  const tableRef = doc(db, TABLES_COLLECTION, String(id));
  await updateDoc(tableRef, {
    status: 'Pendente',
    waiter,
    items: [],
    total: 0,
    startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
};

export const closeTableFirestore = async (id: string | number) => {
  if (!db) return;
  const tableRef = doc(db, TABLES_COLLECTION, String(id));
  await updateDoc(tableRef, {
    status: 'Livre',
    waiter: null,
    items: [],
    total: 0,
    startTime: null
  });
};

// --- Menu Items Service ---

export const getMenuItems = async (): Promise<MenuItem[]> => {
  if (!db) return [];
  const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MenuItem));
};

export const subscribeToMenuItems = (callback: (items: MenuItem[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, MENU_COLLECTION));
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => ({ 
      ...doc.data(),
      id: isNaN(Number(doc.id)) ? doc.id : Number(doc.id) 
    } as unknown as MenuItem));
    callback(items);
  });
};

export const addMenuItemFirestore = async (item: Omit<MenuItem, 'id'>) => {
  if (!db) return;
  const docRef = await addDoc(collection(db, MENU_COLLECTION), item);
  return docRef.id;
};

export const updateMenuItemFirestore = async (id: string | number, data: Partial<MenuItem>) => {
  if (!db) return;
  const itemRef = doc(db, MENU_COLLECTION, String(id));
  await updateDoc(itemRef, data);
};

export const removeMenuItemFirestore = async (id: string | number) => {
  if (!db) return;
  const itemRef = doc(db, MENU_COLLECTION, String(id));
  await deleteDoc(itemRef);
};

// --- Employees Service ---

export const subscribeToEmployees = (callback: (employees: Employee[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, EMPLOYEES_COLLECTION));
  return onSnapshot(q, (querySnapshot) => {
    const employees = querySnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data() 
    } as Employee));
    callback(employees);
  });
};

export const addEmployeeFirestore = async (employee: Omit<Employee, 'id'>) => {
  if (!db) return;
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employee);
  return docRef.id;
};

export const updateEmployeeFirestore = async (id: string, data: Partial<Employee>) => {
  if (!db) return;
  const empRef = doc(db, EMPLOYEES_COLLECTION, id);
  await updateDoc(empRef, data);
};

export const removeEmployeeFirestore = async (id: string) => {
  if (!db) return;
  const empRef = doc(db, EMPLOYEES_COLLECTION, id);
  await deleteDoc(empRef);
};

// Seed function to initialize database with mock data if empty
export const seedDatabase = async (initialTables: Table[], initialMenu: MenuItem[], initialEmployees: Omit<Employee, 'id'>[]) => {
  if (!db) return;
  // Seed Tables
  const tablesSnapshot = await getDocs(collection(db, TABLES_COLLECTION));
  if (tablesSnapshot.empty) {
    for (const table of initialTables) {
      await setDoc(doc(db, TABLES_COLLECTION, String(table.id)), table);
    }
  }

  // Seed Menu
  const menuSnapshot = await getDocs(collection(db, MENU_COLLECTION));
  if (menuSnapshot.empty) {
    for (const item of initialMenu) {
      const { id, ...itemData } = item;
      await setDoc(doc(db, MENU_COLLECTION, String(id)), itemData);
    }
  }

  // Seed Employees
  const employeesSnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
  if (employeesSnapshot.empty) {
    for (const emp of initialEmployees) {
      await addDoc(collection(db, EMPLOYEES_COLLECTION), emp);
    }
  }
};
