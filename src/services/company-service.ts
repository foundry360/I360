'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  description: string;
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
  lastActivity: string;
}

const companiesCollection = collection(db, 'companies');

export async function getCompanies(): Promise<Company[]> {
  const snapshot = await getDocs(companiesCollection);
  return snapshot.docs.map((doc) => doc.data() as Company);
}

export async function searchCompanies(searchTerm: string): Promise<Company[]> {
    const allCompanies = await getCompanies();
    if (!searchTerm) {
        return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allCompanies.filter(company =>
        company.name.toLowerCase().includes(lowercasedTerm) ||
        company.contact.name.toLowerCase().includes(lowercasedTerm) ||
        company.website.toLowerCase().includes(lowercasedTerm)
    );
}

export async function getCompany(id: string): Promise<Company | null> {
    const docRef = doc(db, 'companies', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Company;
    } else {
        return null;
    }
}

export async function createCompany(companyData: Omit<Company, 'id' | 'contact' | 'status' | 'lastActivity'>): Promise<void> {
  const companyId = companyData.name.toLowerCase().replace(/\s+/g, '-');
  const newCompany: Company = {
      ...companyData,
      id: companyId,
      contact: {
        name: 'New Contact', // Placeholder
        avatar: `https://picsum.photos/100/100?q=${Math.random()}`,
      },
      status: 'Active',
      lastActivity: new Date().toISOString(),
  };
  
  await setDoc(doc(companiesCollection, newCompany.id), newCompany);
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<void> {
    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, companyData);
}

export async function deleteCompany(id: string): Promise<void> {
    const docRef = doc(db, 'companies', id);
    await deleteDoc(docRef);
}

export async function deleteCompanies(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, 'companies', id);
      batch.delete(docRef);
    });
    await batch.commit();
}
