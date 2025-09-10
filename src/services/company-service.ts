
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where, addDoc } from 'firebase/firestore';
import { getProjectsForCompany, updateProject } from './project-service';
import { createNotification } from './notification-service';

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
  contact?: {
    name: string;
    avatar: string;
  };
  status: string;
  lastActivity: string;
}

const companiesCollection = collection(db, 'companies');

export async function getCompanies(): Promise<Company[]> {
  try {
    const snapshot = await getDocs(companiesCollection);
    return snapshot.docs.map((doc) => doc.data() as Company);
  } catch (error) {
    console.error("Error fetching companies: ", error);
    return [];
  }
}

export async function searchCompanies(searchTerm: string): Promise<Company[]> {
    const allCompanies = await getCompanies();
    if (!searchTerm) {
        return [];
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allCompanies.filter(company =>
        company.name.toLowerCase().includes(lowercasedTerm) ||
        (company.contact && company.contact.name.toLowerCase().includes(lowercasedTerm)) ||
        company.website.toLowerCase().includes(lowercasedTerm)
    );
}

export async function getCompany(id: string): Promise<Company | null> {
    try {
        const docRef = doc(db, 'companies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Company;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching company: ", error);
        return null;
    }
}

export async function createCompany(companyData: Omit<Company, 'id' | 'contact' | 'status' | 'lastActivity'>): Promise<string> {
  const docRef = doc(collection(db, 'companies'));
  const newCompany: Company = {
      ...companyData,
      id: docRef.id,
      contact: {
        name: '', 
        avatar: '',
      },
      status: 'Active',
      lastActivity: new Date().toISOString(),
  };
  
  await setDoc(docRef, newCompany);
  
  await createNotification({
    message: `New company "${newCompany.name}" has been created.`,
    link: `/dashboard/companies/${docRef.id}/details`,
    type: 'activity',
  });
  
  return docRef.id;
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<void> {
    const companyDocRef = doc(db, 'companies', id);
    const batch = writeBatch(db);

    const currentCompanyDoc = await getDoc(companyDocRef);
    if (!currentCompanyDoc.exists()) {
        throw new Error("Company not found");
    }
    const oldCompanyData = currentCompanyDoc.data() as Company;

    // Update the company document itself
    batch.update(companyDocRef, companyData);

    // If company name is being changed, update associated projects
    if (companyData.name && companyData.name !== oldCompanyData.name) {
        const projects = await getProjectsForCompany(id);
        const newPrefix = companyData.name.substring(0, 4).toUpperCase();
        
        projects.forEach(project => {
            const nameParts = project.name.split('-');
            const oldSuffix = nameParts.length > 1 ? nameParts.slice(1).join('-') : project.name;
            const newProjectName = `${newPrefix}-${oldSuffix}`;
            
            const projectDocRef = doc(db, 'projects', project.id);
            batch.update(projectDocRef, { name: newProjectName, companyName: companyData.name });
        });
    }

    await batch.commit();
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
