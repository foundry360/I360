'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  contact: {
    name: string;
    avatar: string;
  };
  status: string;
}

// In-memory store for prototyping
let companiesStore: Company[] = [
    {
      id: 'acme-inc',
      name: 'Acme Inc',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      phone: '555-1234',
      website: 'acmeinc.com',
      contact: {
        name: 'John Doe',
        avatar: 'https://picsum.photos/100/100?q=1',
      },
      status: 'Active',
    },
    {
      id: 'widgets-co',
      name: 'Widgets Co',
      street: '456 Oak Ave',
      city: 'Someplace',
      state: 'NY',
      zip: '54321',
      phone: '555-5678',
      website: 'widgetsco.com',
      contact: {
        name: 'Jane Smith',
        avatar: 'https://picsum.photos/100/100?q=2',
      },
      status: 'Active',
    },
];

const companiesCollection = collection(db, 'companies');

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCompanies(): Promise<Company[]> {
  await delay(500); // Simulate network delay
  // To use firestore, uncomment the lines below and remove the return statement for the in-memory store
  // const snapshot = await getDocs(companiesCollection);
  // return snapshot.docs.map((doc) => doc.data() as Company);
  return [...companiesStore];
}

export async function getCompany(id: string): Promise<Company | null> {
    await delay(500);
    // To use firestore, uncomment the lines below and remove the return statement for the in-memory store
    // const docRef = doc(db, 'companies', id);
    // const docSnap = await getDoc(docRef);
    // if (docSnap.exists()) {
    //     return docSnap.data() as Company;
    // } else {
    //     return null;
    // }
    const company = companiesStore.find(c => c.id === id);
    return company || null;
}

export async function createCompany(companyData: Omit<Company, 'id' | 'contact' | 'status'>): Promise<void> {
  await delay(500);
  const newCompany: Company = {
      ...companyData,
      id: companyData.name.toLowerCase().replace(/\s+/g, '-'),
      contact: {
        name: 'New Contact', // Placeholder
        avatar: `https://picsum.photos/100/100?q=${companiesStore.length + 1}`,
      },
      status: 'Active',
  };
  
  // To use firestore, uncomment the line below and remove the push to the in-memory store
  // await setDoc(doc(companiesCollection, newCompany.id), newCompany);
  companiesStore.push(newCompany);
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<void> {
    await delay(500);
    // To use firestore, uncomment the lines below
    // const docRef = doc(db, 'companies', id);
    // await updateDoc(docRef, companyData);
    
    const index = companiesStore.findIndex(c => c.id === id);
    if (index !== -1) {
        companiesStore[index] = { ...companiesStore[index], ...companyData };
    }
}

export async function deleteCompany(id: string): Promise<void> {
    await delay(500);
    // To use firestore, uncomment the lines below
    // const docRef = doc(db, 'companies', id);
    // await deleteDoc(docRef);
    
    companiesStore = companiesStore.filter(c => c.id !== id);
}
