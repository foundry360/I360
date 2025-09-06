
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

export async function getUniqueTags(): Promise<string[]> {
    const snapshot = await getDocs(userStoriesCollection);
    const allTags = snapshot.docs.flatMap(doc => (doc.data() as UserStory).tags || []);
    return [...new Set(allTags)].sort();
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
export async function createTag(newTag: string): Promise<void> {
    // Tags are not stored in a separate collection, they exist within stories.
    // This function is a placeholder for if we decide to create a separate collection.
    // For now, adding a tag happens when creating/updating a story.
    // To "create" a tag, we can add a dummy story with that tag, or just let it be created organically.
    // Let's just log a message for now.
    console.log(`A new tag "${newTag}" will be available for use.`);
}


export async function updateTag(oldTag: string, newTag: string): Promise<void> {
  const snapshot = await getDocs(userStoriesCollection);
  const batch = writeBatch(db);

  snapshot.docs.forEach(docSnapshot => {
    const story = docSnapshot.data() as UserStory;
    if (story.tags && story.tags.includes(oldTag)) {
      const newTags = story.tags.map(t => (t === oldTag ? newTag : t));
      batch.update(docSnapshot.ref, { tags: newTags });
    }
  });

  await batch.commit();
}

export async function deleteTag(tagToDelete: string): Promise<void> {
    const snapshot = await getDocs(userStoriesCollection);
    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnapshot => {
        const story = docSnapshot.data() as UserStory;
        if(story.tags && story.tags.includes(tagToDelete)) {
            const newTags = story.tags.filter(t => t !== tagToDelete);
            batch.update(docSnapshot.ref, { tags: newTags });
        }
    });

    await batch.commit();
}
