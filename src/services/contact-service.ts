
'use client';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
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

export async function getContacts(): Promise<Contact[]> {
  const snapshot = await getDocs(contactsCollection);
  const contacts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Contact));

  // Fetch company names for each contact
  for (const contact of contacts) {
    if (contact.companyId) {
      const companyDoc = await getDoc(doc(db, 'companies', contact.companyId));
      if (companyDoc.exists()) {
        contact.companyName = (companyDoc.data() as Company).name;
      }
    }
  }
  return contacts;
}

export async function getContactsForCompany(companyId: string): Promise<Contact[]> {
    const q = query(contactsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Contact);
}


export async function createContact(contactData: Omit<Contact, 'id' | 'lastActivity' | 'avatar'>): Promise<void> {
  const docRef = doc(contactsCollection);
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
