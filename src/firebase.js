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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Moderne offline cache (erstatter enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Auth
setPersistence(auth, browserLocalPersistence);
const provider = new GoogleAuthProvider();
provider.addScope("profile");
provider.addScope("email");

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

// ─── Firestore helpers ────────────────────────────────────────────────────────
const userDocRef = (uid) => doc(db, "users", uid, "data", "profile");

export const saveToFirestore = async (uid, data) => {
  try {
    await setDoc(userDocRef(uid), data, { merge: true });
  } catch (e) {
    console.error("Firestore gem fejl:", e);
  }
};

export const loadFromFirestore = async (uid) => {
  try {
    const snap = await getDoc(userDocRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("Firestore indlæs fejl:", e);
    return null;
  }
};

export const subscribeToFirestore = (uid, callback) => {
  return onSnapshot(userDocRef(uid), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};
