
'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import type { Company } from './company-service';
import type { Contact } from './contact-service';
import { BacklogItem, BacklogItemStatus, BacklogItemPriority, BacklogItemType } from './backlog-item-service';
import type { Epic } from './epic-service';
import type { UserStory } from './user-story-service';

const ACME_INC_ID = 'acme-inc';

const initialProjectTemplate = [
    {
        epic: { title: "Foundation & Strategic Alignment", description: "This category focuses on establishing a strong foundation for the GTM strategy by aligning all departments and defining the core principles of the engagement.", tags: ["Strategy", "Foundation", "GTM"] },
        backlogItems: [
            "Establish committee charter and weekly meeting cadence",
            "Create project management infrastructure and communication protocols",
            "Perform current-state analysis",
            "Execute lost deal analysis",
            "Perform competitive analysis update and differentiation assessment",
            "Facilitate cross-functional ICP workshops",
            "Document detailed ICP including demographics, psychographics, and behaviors",
            "Analyze customer research insights for value driver identification",
            "Conduct value proposition development workshops with stakeholders",
            "Create unified messaging framework with competitive differentiation",
            "Develop objection handling and proof point documentation",
            "Validate messaging with customer feedback and A/B testing",
            "Design comprehensive sales enablement program with new messaging",
            "Realign marketing campaigns and content with updated ICP",
            "Update all customer-facing materials (proposals, presentations, website)",
            "Execute internal communication rollout across organization",
            "Implement messaging consistency measurement and monitoring"
        ]
    },
    {
        epic: { title: "RevOps Foundation & Data Infrastructure", description: "This category is about building a robust data and technology infrastructure to support all revenue-generating activities.", tags: ["RevOps", "Data", "Tech Stack"] },
        backlogItems: [
            "Conduct a comprehensive CRM configuration audit",
            "Implement data hygiene protocols and validation rules",
            "Execute systematic data cleansing (prioritizing customer/prospect data)",
            "Optimize page layouts, custom fields, and user permissions",
            "Map integration architecture and data flow requirements",
            "Implement priority integrations (Marketing automation, Customer success platform)",
            "Develop workflow automation (lead routing, opportunity progression)",
            "Configure automated data synchronization between systems",
            "Test integrations and establish failure/recovery procedures",
            "Create real-time performance dashboards for all GTM functions",
            "Implement automated forecasting system (replace manual Excel processes)",
            "Deploy advanced lead scoring and customer health monitoring",
            "Establish KPI tracking with trend analysis and alerts",
            "Build an executive dashboard with strategic metrics",
            "Document optimized workflows and standard operating procedures",
            "Create user adoption measurement and feedback systems",
            "Establish ongoing data quality monitoring and maintenance",
            "Implement change management support for technology adoption"
        ]
    },
    {
        epic: { title: "Sales Process Enhancement & Pipeline Optimization", description: "This category focuses on standardizing and optimizing the sales process to improve efficiency and increase pipeline velocity.", tags: ["Sales", "Pipeline", "Process"] },
        backlogItems: [
            "Map current sales process and identify bottlenecks",
            "Design optimized sales methodology aligned with customer journey",
            "Create stage-gate criteria and advancement requirements",
            "Develop sales playbooks for different customer segments",
            "Implement opportunity management best practices",
            "Establish pipeline coverage targets (move from 1x to 4x)",
            "Implement lead qualification framework (improve from <20% to 50% conversion)",
            "Create pipeline health monitoring and alerts",
            "Design territory and account assignment optimization",
            "Establish regular pipeline review cadence and procedures",
            "Create competitive battlecards and positioning materials",
            "Develop proposal templates and sales collateral library",
            "Implement sales training on new messaging and processes",
            "Establish ongoing coaching and skill development programs",
            "Create performance tracking and improvement plans"
        ]
    },
    {
        epic: { title: "Customer Experience & Lifecycle Management", description: "This category aims to improve the customer experience across the entire lifecycle to drive retention and expansion.", tags: ["Customer Success", "CX", "Lifecycle"] },
        backlogItems: [
            "Execute comprehensive customer journey mapping across all touchpoints",
            "Identify friction points and experience gaps throughout lifecycle",
            "Develop customer segmentation and persona-based experience paths",
            "Design onboarding optimization to reduce time-to-value (target: 6+ months to 2 months)",
            "Create customer journey measurement and monitoring systems",
            "Implement a customer health scoring system with predictive analytics",
            "Design proactive customer success workflows and intervention triggers",
            "Create customer success playbooks (onboarding, adoption, expansion, renewal)",
            "Establish regular business review cycles and value demonstration",
            "Build customer communication automation and personalization",
            "Implement comprehensive feedback system (NPS, CSAT, interviews)",
            "Create systematic customer feedback analysis and response processes",
            "Develop customer advocacy and referral programs",
            "Build a case study and a success story development process",
            "Establish customer advisory board and strategic relationship programs",
            "Design account-based marketing campaigns for existing customers",
            "Create expansion opportunity identification and management processes",
            "Implement renewal management with early risk identification",
            "Develop customer value demonstration and ROI reporting",
            "Build competitive win-back and retention programs"
        ]
    },
    {
        epic: { title: "Performance Measurement & Continuous Optimization", description: "This category is focused on establishing a data-driven culture of continuous improvement and performance measurement.", tags: ["Analytics", "KPIs", "Optimization"] },
        backlogItems: [
            "Establish a comprehensive KPI framework across all GTM domains",
            "Create performance benchmarking against industry standards",
            "Implement real-time performance monitoring and alerting",
            "Design an executive dashboard with key transformation metrics",
            "Build automated reporting and insight generation",
            "Implement predictive analytics for customer behavior and churn risk",
            "Deploy competitive intelligence and market positioning optimization",
            "Create advanced forecasting with scenario planning capabilities",
            "Build customer lifetime value optimization frameworks",
            "Establish market opportunity identification and prioritization systems",
            "Design systematic performance review and optimization cycles",
            "Create feedback collection and analysis processes",
            "Implement A/B testing framework for process and messaging optimization",
            "Establish innovation and experimentation processes",
            "Build knowledge management and organizational learning systems"
        ]
    },
    {
        epic: { title: "Advanced Capabilities & Scaling", description: "This category involves implementing advanced technologies and strategic capabilities to prepare the organization for future growth and scaling.", tags: ["AI", "Scaling", "Automation"] },
        backlogItems: [
            "Deploy AI-enhanced lead scoring and customer behavior prediction",
            "Implement conversation intelligence and sales process optimization",
            "Create predictive customer health and churn modeling",
            "Build intelligent content and campaign personalization",
            "Establish automated competitive analysis and response systems",
            "Implement end-to-end customer lifecycle automation",
            "Create advanced territory and account optimization systems",
            "Build an intelligent proposal and pricing optimization",
            "Deploy automated market opportunity identification",
            "Establish self-healing system monitoring and maintenance",
            "Create market expansion readiness assessment and planning",
            "Build scalable process frameworks for geographic/segment expansion",
            "Implement strategic partnership and channel development",
            "Establish competitive moat development and protection",
            "Create acquisition integration and synergy realization capabilities"
        ]
    }
];

const initialUserStories: Omit<UserStory, 'id' | 'createdAt'>[] = initialProjectTemplate.map(item => ({
    title: item.epic.title,
    story: item.epic.description,
    acceptanceCriteria: item.backlogItems,
    tags: item.epic.tags,
}));


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
        
        const acmeProject = {
            id: 'acme-inc-project',
            name: 'ACME-Default Project',
            description: 'Default seed project for Acme Inc.',
            companyId: ACME_INC_ID,
            status: 'Active' as const,
            priority: 'High' as const,
            startDate: new Date().toISOString(),
            owner: 'Wile E. Coyote',
            ownerAvatarUrl: `https://i.pravatar.cc/150?u=wile@acme.inc`,
            team: 'Wile E. Coyote, Road Runner',
            category: 'Execution' as const,
        }

        try {
            const batch = writeBatch(db);

            // Set Company
            batch.set(companyDocRef, acmeCompany);
            
            // Set Contacts
            const contact1Ref = doc(db, 'contacts', 'wile-e-coyote');
            batch.set(contact1Ref, { ...wileContact, id: 'wile-e-coyote' });

            const contact2Ref = doc(db, 'contacts', 'road-runner');
            batch.set(contact2Ref, { ...roadRunnerContact, id: 'road-runner' });

            // Set Project
            const projectRef = doc(db, 'projects', 'acme-inc-project');
            batch.set(projectRef, acmeProject);
            
            // Set User Stories
            const userStoriesCollectionRef = collection(db, 'userStories');
            initialUserStories.forEach(story => {
                const storyRef = doc(userStoriesCollectionRef);
                const storyWithTimestamp: Omit<UserStory, 'id'> = {
                    ...story,
                    createdAt: serverTimestamp()
                };
                batch.set(storyRef, { ...storyWithTimestamp, id: storyRef.id });
            });
            
            await batch.commit();

            console.log("Successfully seeded 'Acme Inc', contacts, project, and user stories.");
        } catch (error) {
            console.error("Error seeding data: ", error);
        }
    }
};
