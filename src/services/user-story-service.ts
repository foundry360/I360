
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
  where,
  arrayRemove,
  getDoc,
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
  // 1. Get all existing user story titles to prevent duplicates
  const storiesQuery = query(userStoriesCollection);
  const storiesSnapshot = await getDocs(storiesQuery);
  const existingStoryTitles = new Set(storiesSnapshot.docs.map(doc => (doc.data() as UserStory).title.toLowerCase().trim()));

  // 2. Get all existing tags to prevent creating duplicate tags
  const tagsQuery = query(tagsCollection);
  const tagsSnapshot = await getDocs(tagsQuery);
  const existingTags = new Map(tagsSnapshot.docs.map(doc => [(doc.data() as Tag).name.toLowerCase().trim(), doc.data() as Tag]));

  const batch = writeBatch(db);
  let importedCount = 0;
  
  // 3. Filter out stories that already exist by title
  const storiesToCreate = storiesData.filter(story => {
    const normalizedTitle = story.title.toLowerCase().trim();
    return !existingStoryTitles.has(normalizedTitle);
  });
  
  const skippedCount = storiesData.length - storiesToCreate.length;

  // 4. Identify new tags from the stories that need to be created
  const uniqueNewTags = new Set<string>();
  storiesToCreate.forEach(story => {
    story.tags?.forEach(tagName => {
      if (tagName && !existingTags.has(tagName.toLowerCase().trim())) {
        uniqueNewTags.add(tagName);
      }
    });
  });
  
  // 5. Create new tags if any
  uniqueNewTags.forEach(tagName => {
      const newTagRef = doc(tagsCollection);
      const newTag: Tag = {
          id: newTagRef.id,
          name: tagName,
          icon: 'Layers' // Default icon for new tags
      };
      batch.set(newTagRef, newTag);
  });

  // 6. Create the user stories
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

  if (importedCount > 0 || uniqueNewTags.size > 0) {
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

export async function deleteUserStories(ids: string[]): Promise<void> {
    const batch = writeBatch(db);
    ids.forEach(id => {
        const docRef = doc(userStoriesCollection, id);
        batch.delete(docRef);
    });
    await batch.commit();
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
    const storiesSnapshot = await getDocs(query(userStoriesCollection, where('tags', 'array-contains', tagName)));
    storiesSnapshot.docs.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, { tags: arrayRemove(tagName) });
    });

    await batch.commit();
}


export async function batchUpdateTags(updates: {
  tagsToAdd: Omit<Tag, 'id'>[],
  tagsToUpdate: Tag[],
  tagsToDelete: Tag[],
}) {
  const { tagsToAdd, tagsToUpdate, tagsToDelete } = updates;
  const batch = writeBatch(db);

  // Handle deletions
  for (const tag of tagsToDelete) {
    const tagRef = doc(db, 'tags', tag.id);
    batch.delete(tagRef);

    // Remove tag from stories
    const storiesQuery = query(userStoriesCollection, where('tags', 'array-contains', tag.name));
    const storiesSnapshot = await getDocs(storiesQuery);
    storiesSnapshot.forEach(storyDoc => {
      batch.update(storyDoc.ref, { tags: arrayRemove(tag.name) });
    });
  }
  
  // Handle updates
  for (const tag of tagsToUpdate) {
    const tagRef = doc(db, 'tags', tag.id);
    const { id, ...tagData } = tag; // Don't write the id into the document body
    batch.update(tagRef, tagData);
    
    // If tag name changed, we need to update all stories
    const originalTagDoc = await getDoc(tagRef);
    const originalTagData = originalTagDoc.data() as Tag | undefined;
    if(originalTagData && originalTagData.name !== tag.name) {
       const storiesQuery = query(userStoriesCollection, where('tags', 'array-contains', originalTagData.name));
       const storiesSnapshot = await getDocs(storiesQuery);
       storiesSnapshot.forEach(storyDoc => {
          const storyData = storyDoc.data() as UserStory;
          const updatedTags = storyData.tags.map(t => t === originalTagData.name ? tag.name : t);
          batch.update(storyDoc.ref, { tags: updatedTags });
       });
    }
  }

  // Handle additions
  for (const tagData of tagsToAdd) {
    const newTagRef = doc(tagsCollection);
    batch.set(newTagRef, { ...tagData, id: newTagRef.id });
  }

  await batch.commit();
}
