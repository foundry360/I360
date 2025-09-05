
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
} from 'firebase/firestore';

export interface UserStory {
  id: string;
  title: string;
  story: string;
  acceptanceCriteria: string[];
  tags: string[];
  points?: number;
  createdAt: FieldValue;
}

const userStoriesCollection = collection(db, 'userStories');

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
    points: storyData.points || 0,
    createdAt: serverTimestamp(),
  });
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function bulkCreateUserStories(storiesData: Omit<UserStory, 'id' | 'createdAt'>[]): Promise<void> {
  const batch = writeBatch(db);

  storiesData.forEach(storyData => {
    const docRef = doc(userStoriesCollection);
    const storyWithTimestamp = {
      ...storyData,
      id: docRef.id,
      points: storyData.points || 0,
      createdAt: serverTimestamp(),
    };
    batch.set(docRef, storyWithTimestamp);
  });

  await batch.commit();
}


export async function updateUserStory(id: string, storyData: Partial<UserStory>): Promise<void> {
  const docRef = doc(db, 'userStories', id);
  await updateDoc(docRef, storyData);
}

export async function deleteUserStory(id: string): Promise<void> {
  const docRef = doc(db, 'userStories', id);
  await deleteDoc(docRef);
}
