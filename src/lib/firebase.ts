import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let firestoreDb: Firestore | null = null;

/**
 * Initializes and returns the Firestore instance using the applet configuration.
 */
export function getFirebaseFirestore(): Firestore {
  if (firestoreDb) {
    return firestoreDb;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Connect with specific databaseId if defined
  if (firebaseConfig.firestoreDatabaseId) {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }

  return firestoreDb;
}
