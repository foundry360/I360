
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
  arrayUnion,
  arrayRemove,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import type { UserStory } from './user-story-service';

export interface StoryCollection {
  id: string;
  name: string;
  description: string;
  userStoryIds: string[];
  createdAt: string;
}

const collectionsCollection = collection(db, 'storyCollections');

export async function getCollections(): Promise<StoryCollection[]> {
  try {
    const snapshot = await getDocs(collectionsCollection);
    return snapshot.docs.map((doc) => doc.data() as StoryCollection);
  } catch (error) {
    console.error("Error fetching collections: ", error);
    return [];
  }
}

export async function createCollection(collectionData: Omit<StoryCollection, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collectionsCollection, {});
  const newCollection: StoryCollection = {
    ...collectionData,
    id: docRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(docRef, newCollection);
  return docRef.id;
}

export async function updateCollection(id: string, data: Partial<Omit<StoryCollection, 'id'>>): Promise<void> {
    const docRef = doc(db, 'storyCollections', id);
    await updateDoc(docRef, data);
}

export async function deleteCollection(id: string): Promise<void> {
    const docRef = doc(db, 'storyCollections', id);
    await deleteDoc(docRef);
}

export async function addStoriesToCollection(collectionId: string, storyIds: string[]): Promise<void> {
    const docRef = doc(db, 'storyCollections', collectionId);
    await updateDoc(docRef, {
        userStoryIds: arrayUnion(...storyIds)
    });
}

export async function removeStoryFromCollection(collectionId: string, storyId: string): Promise<void> {
    const docRef = doc(db, 'storyCollections', collectionId);
    await updateDoc(docRef, {
        userStoryIds: arrayRemove(storyId)
    });
}
