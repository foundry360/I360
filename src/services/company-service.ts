'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

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

const companiesCollection = collection(db, 'companies');

export async function getCompanies(): Promise<Company[]> {
  const snapshot = await getDocs(companiesCollection);
  return snapshot.docs.map((doc) => doc.data() as Company);
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

export async function createCompany(company: Company): Promise<void> {
  const companyRef = doc(companiesCollection, company.id);
  await setDoc(companyRef, company);
}
