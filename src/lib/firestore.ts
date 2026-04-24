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
import { Table, MenuItem, TableStatus } from "@/context/RestaurantContext";

const TABLES_COLLECTION = "tables";
const MENU_COLLECTION = "menuItems";

// --- Tables Service ---

export const getTables = async (): Promise<Table[]> => {
  const querySnapshot = await getDocs(collection(db, TABLES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Table));
};

export const subscribeToTables = (callback: (tables: Table[]) => void) => {
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
  const tableRef = doc(db, TABLES_COLLECTION, String(id));
  await updateDoc(tableRef, data);
};

export const openTableFirestore = async (id: string | number, waiter: string) => {
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
  const querySnapshot = await getDocs(collection(db, MENU_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MenuItem));
};

export const subscribeToMenuItems = (callback: (items: MenuItem[]) => void) => {
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
  const docRef = await addDoc(collection(db, MENU_COLLECTION), item);
  return docRef.id;
};

export const updateMenuItemFirestore = async (id: string | number, data: Partial<MenuItem>) => {
  const itemRef = doc(db, MENU_COLLECTION, String(id));
  await updateDoc(itemRef, data);
};

export const removeMenuItemFirestore = async (id: string | number) => {
  const itemRef = doc(db, MENU_COLLECTION, String(id));
  await deleteDoc(itemRef);
};

// Seed function to initialize database with mock data if empty
export const seedDatabase = async (initialTables: Table[], initialMenu: MenuItem[]) => {
  const tablesSnapshot = await getDocs(collection(db, TABLES_COLLECTION));
  if (tablesSnapshot.empty) {
    for (const table of initialTables) {
      await setDoc(doc(db, TABLES_COLLECTION, String(table.id)), table);
    }
  }

  const menuSnapshot = await getDocs(collection(db, MENU_COLLECTION));
  if (menuSnapshot.empty) {
    for (const item of initialMenu) {
      const { id, ...itemData } = item;
      await setDoc(doc(db, MENU_COLLECTION, String(id)), itemData);
    }
  }
};
