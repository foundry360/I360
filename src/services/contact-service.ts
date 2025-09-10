
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, addDoc } from 'firebase/firestore';
import { getCompany, updateCompany, type Company } from './company-service';
import { createNotification } from './notification-service';

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
  const companySnapshot = await getDocs(collection(db, 'companies'));
  const companyMap = new Map(companySnapshot.docs.map(doc => [doc.id, (doc.data() as Company).name]));

  const contactSnapshot = await getDocs(contactsCollection);
  const contacts = contactSnapshot.docs.map(doc => {
    const contact = doc.data() as Contact;
    contact.companyName = companyMap.get(contact.companyId) || 'Unknown Company';
    return contact;
  });
  return contacts;
}

export async function getContactsForCompany(companyId: string): Promise<Contact[]> {
    const q = query(contactsCollection, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    const companyName = companyDoc.exists() ? (companyDoc.data() as Company).name : 'Unknown Company';
    return snapshot.docs.map(d => ({...d.data(), companyName} as Contact));
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
    if (company) {
        if (!company.contact?.name) {
            await updateCompany(contactData.companyId, {
                contact: {
                    name: newContact.name,
                    avatar: newContact.avatar
                }
            });
        }
        await createNotification({
            message: `New contact "${newContact.name}" was added for ${company.name}.`,
            link: `/dashboard/companies/${contactData.companyId}/details`,
            type: 'activity',
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
