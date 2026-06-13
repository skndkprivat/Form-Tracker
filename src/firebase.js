import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  enableIndexedDbPersistence
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR8P1q78ja5yZnPzUR7dHgGiwVvgyxG1k",
  authDomain: "form-tracker-a9563.firebaseapp.com",
  projectId: "form-tracker-a9563",
  storageBucket: "form-tracker-a9563.firebasestorage.app",
  messagingSenderId: "254905246537",
  appId: "1:254905246137:web:e18dd9d5d286f93cdc5668"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Offline support — data cached lokalt hvis ingen internet
enableIndexedDbPersistence(db).catch(() => {});

// Auth
setPersistence(auth, browserLocalPersistence);
const provider = new GoogleAuthProvider();
provider.addScope("profile");
provider.addScope("email");

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── Firestore helpers ────────────────────────────────────────────────────────
// Alle brugerdata gemmes under /users/{uid}/data/profile
const userDocRef = (uid) => doc(db, "users", uid, "data", "profile");

// Gem hele state til Firestore (debounced i appen)
export const saveToFirestore = async (uid, data) => {
  try {
    await setDoc(userDocRef(uid), data, { merge: true });
  } catch (e) {
    console.error("Firestore gem fejl:", e);
  }
};

// Indlæs data én gang ved login
export const loadFromFirestore = async (uid) => {
  try {
    const snap = await getDoc(userDocRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Firestore indlæs fejl:", e);
    return null;
  }
};

// Lyt på ændringer i realtid (synkroniser mellem enheder)
export const subscribeToFirestore = (uid, callback) => {
  return onSnapshot(userDocRef(uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};
