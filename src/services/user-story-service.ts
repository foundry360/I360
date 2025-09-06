
'use client';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FieldValue,
  writeBatch,
  query,
} from 'firebase/firestore';
import { tagConfig, type TagConfig } from '@/lib/tag-config';

export interface UserStory {
  id: string;
  title: string;
  story: string;
  acceptanceCriteria: string[];
  tags: string[];
  points?: number;
  createdAt: FieldValue;
}

export interface Tag {
  id: string;
  name: string;
  icon: TagConfig['iconName'];
}

const userStoriesCollection = collection(db, 'userStories');
const tagsCollection = collection(db, 'tags');

export async function getTags(): Promise<Tag[]> {
    const snapshot = await getDocs(tagsCollection);
    if (snapshot.empty) {
        // Seed default tags if none exist
        const batch = writeBatch(db);
        const defaultTags: Omit<Tag, 'id'>[] = [
            { name: "Foundation & Strategic Alignment", icon: 'BookCopy' },
            { name: "RevOps Foundation & Data Infrastructure", icon: 'Database' },
            { name: "Sales Process Enhancement & Pipeline Optimization", icon: 'Megaphone' },
            { name: "Customer Experience & Lifecycle Management", icon: 'HeartHandshake' },
            { name: "Performance Measurement & Continuous Optimization", icon: 'BarChart3' },
            { name: "Advanced Capabilities & Scaling", icon: 'Scaling' },
            { name: "Uncategorized", icon: 'Layers' },
        ];
        const createdTags: Tag[] = [];
        defaultTags.forEach(tag => {
            const docRef = doc(tagsCollection);
            const newTag = { ...tag, id: docRef.id };
            batch.set(docRef, newTag);
            createdTags.push(newTag);
        });
        await batch.commit();
        return createdTags.sort((a, b) => a.name.localeCompare(b.name));
    }
    return snapshot.docs.map(doc => doc.data() as Tag).sort((a,b) => a.name.localeCompare(b.name));
}


export async function getUserStories(): Promise<(Omit<UserStory, 'createdAt'> & { createdAt: string })[]> {
  try {
    const snapshot = await getDocs(userStoriesCollection);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        } as Omit<UserStory, 'createdAt'> & { createdAt: string };
    });
  } catch (error) {
    console.error("Error fetching user stories: ", error);
    return [];
  }
}

export async function createUserStory(storyData: Omit<UserStory, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(userStoriesCollection, {
    ...storyData,
    title: storyData.title || '',
    story: storyData.story || '',
    points: storyData.points || 0,
    createdAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function bulkCreateUserStories(storiesData: Omit<UserStory, 'id' | 'createdAt'>[]): Promise<{ importedCount: number, skippedCount: number }> {
  const q = query(userStoriesCollection);
  const snapshot = await getDocs(q);
  const existingTitles = new Set(snapshot.docs.map(doc => (doc.data() as UserStory).title.toLowerCase().trim()));

  const batch = writeBatch(db);
  let importedCount = 0;
  
  const storiesToCreate = storiesData.filter(story => {
    const normalizedTitle = story.title.toLowerCase().trim();
    return !existingTitles.has(normalizedTitle);
  });
  
  const skippedCount = storiesData.length - storiesToCreate.length;

  storiesToCreate.forEach(storyData => {
    const docRef = doc(userStoriesCollection);
    const storyWithTimestamp = {
      ...storyData,
      id: docRef.id,
      points: storyData.points || 0,
      createdAt: serverTimestamp(),
    };
    batch.set(docRef, storyWithTimestamp);
    importedCount++;
  });

  if (importedCount > 0) {
      await batch.commit();
  }
  
  return { importedCount, skippedCount };
}


export async function updateUserStory(id: string, storyData: Partial<UserStory>): Promise<void> {
  const docRef = doc(db, 'userStories', id);
  await updateDoc(docRef, storyData);
}

export async function deleteUserStory(id: string): Promise<void> {
  const docRef = doc(db, 'userStories', id);
  await deleteDoc(docRef);
}

// Functions for tag management
export async function createTag(tagData: Omit<Tag, 'id'>): Promise<string> {
    const docRef = await addDoc(tagsCollection, {});
    await updateDoc(docRef, { ...tagData, id: docRef.id });
    return docRef.id;
}


export async function updateTag(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<void> {
    const docRef = doc(db, 'tags', id);
    await updateDoc(docRef, data);
}

export async function deleteTag(id: string, tagName: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete the tag document
    const tagRef = doc(db, 'tags', id);
    batch.delete(tagRef);

    // Remove the tag from all stories that use it
    const storiesSnapshot = await getDocs(userStoriesCollection);
    storiesSnapshot.docs.forEach(docSnapshot => {
        const story = docSnapshot.data() as UserStory;
        if(story.tags && story.tags.includes(tagName)) {
            const newTags = story.tags.filter(t => t !== tagName);
            batch.update(docSnapshot.ref, { tags: newTags });
        }
    });

    await batch.commit();
}
