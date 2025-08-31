
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Company } from './company-service';
import type { Contact } from './contact-service';

const ACME_INC_ID = 'acme-inc';

export const seedInitialData = async () => {
    const companyDocRef = doc(db, 'companies', ACME_INC_ID);
    const companyDoc = await getDoc(companyDocRef);

    if (!companyDoc.exists()) {
        console.log("Default company 'Acme Inc' not found. Seeding data...");
        const acmeCompany: Company = {
            id: ACME_INC_ID,
            name: 'Acme Inc',
            description: 'A leading manufacturer of everything.',
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '12345',
            phone: '555-123-4567',
            website: 'acmeinc.com',
            status: 'Active',
            lastActivity: new Date().toISOString(),
            contact: {
                name: 'Wile E. Coyote',
                avatar: `https://i.pravatar.cc/150?u=wile@acme.inc`
            }
        };

        const wileContact: Omit<Contact, 'id'> = {
            name: 'Wile E. Coyote',
            email: 'wile@acme.inc',
            phone: '555-123-4568',
            title: 'Chief Procurement Officer',
            companyId: ACME_INC_ID,
            lastActivity: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=wile@acme.inc`
        };

        const roadRunnerContact: Omit<Contact, 'id'> = {
            name: 'Road Runner',
            email: 'beep.beep@acme.inc',
            phone: '555-123-4569',
            title: 'Logistics Specialist',
            companyId: ACME_INC_ID,
            lastActivity: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=beep.beep@acme.inc`
        };

        try {
            await setDoc(companyDocRef, acmeCompany);
            
            const contact1Ref = doc(db, 'contacts', 'wile-e-coyote');
            await setDoc(contact1Ref, { ...wileContact, id: 'wile-e-coyote' });

            const contact2Ref = doc(db, 'contacts', 'road-runner');
            await setDoc(contact2Ref, { ...roadRunnerContact, id: 'road-runner' });
            
            console.log("Successfully seeded 'Acme Inc' and contacts.");
        } catch (error) {
            console.error("Error seeding data: ", error);
        }
    }
};
