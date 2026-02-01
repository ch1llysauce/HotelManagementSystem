// src/firestore.ts
import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, CollectionReference, Firestore } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

// Example: collection reference
export const usersCollection = collection(db, "users");
export const roomsCollection = collection(db, "rooms");

// Firestore helpers

// Get all documents from a collection
export const getCollectionData = async (colRef: CollectionReference<DocumentData>) => {
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get single document
export const getDocumentData = async (colName: string, docId: string) => {
  const docRef = doc(db, colName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Add / update document
export const setDocumentData = async (colName: string, docId: string, data: object) => {
  const docRef = doc(db, colName, docId);
  await setDoc(docRef, data, { merge: true }); // merge = update if exists
};

// Delete document
export const deleteDocument = async (colName: string, docId: string) => {
  const docRef = doc(db, colName, docId);
  await deleteDoc(docRef);
};
