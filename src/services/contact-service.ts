
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, addDoc } from 'firebase/firestore';
import { getCompany, updateCompany, type Company } from './company-service';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  companyName?: string; 
  lastActivity: string;
  avatar: string;
}

const contactsCollection = collection(db, 'contacts');
const companiesCollection = collection(db, 'companies');

export async function getContacts(): Promise<Contact[]> {
  // 1. Fetch all companies and create a map for efficient lookup.
  const companySnapshot = await getDocs(companiesCollection);
  const companyMap = new Map<string, string>();
  companySnapshot.forEach(doc => {
      const company = doc.data() as Company;
      companyMap.set(company.id, company.name);
  });

  // 2. Fetch all contacts.
  const contactSnapshot = await getDocs(contactsCollection);

  // 3. Map contacts and add company names from the map.
  const contacts = contactSnapshot.docs.map(doc => {
      const contact = { id: doc.id, ...doc.data() } as Contact;
      if (contact.companyId && companyMap.has(contact.companyId)) {
          contact.companyName = companyMap.get(contact.companyId);
      } else {
          contact.companyName = 'Unknown Company';
      }
      return contact;
  });

  return contacts;
}

export async function getContactsForCompany(companyId: string): Promise<Contact[]> {
    const q = query(contactsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Contact);
}


export async function createContact(contactData: Omit<Contact, 'id' | 'lastActivity' | 'avatar'>): Promise<void> {
  const docRef = await addDoc(contactsCollection, {});
  
  const newContact: Contact = {
      ...contactData,
      id: docRef.id,
      lastActivity: new Date().toISOString(),
      avatar: `https://i.pravatar.cc/150?u=${contactData.email}`
  };
  
  await setDoc(docRef, newContact);

  // Check if this company has a primary contact yet. If not, make this the one.
  if (contactData.companyId) {
    const company = await getCompany(contactData.companyId);
    if (company && !company.contact?.name) {
        await updateCompany(contactData.companyId, {
            contact: {
                name: newContact.name,
                avatar: newContact.avatar
            }
        });
    }
  }
}

export async function updateContact(id: string, contactData: Partial<Contact>): Promise<void> {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, contactData);
}

export async function deleteContact(id: string): Promise<void> {
    const docRef = doc(db, 'contacts', id);
    await deleteDoc(docRef);
}

export async function deleteContacts(ids: string[]): Promise<void>
{
    const batch = writeBatch(db);
    ids.forEach(id => {
      const docRef = doc(db, 'contacts', id);
      batch.delete(docRef);
    });
    await batch.commit();
}
