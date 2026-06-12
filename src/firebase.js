import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCR8P1q78ja5yZnPzUR7dHgGiwVvgyxG1k",
  authDomain: "form-tracker-a9563.firebaseapp.com",
  projectId: "form-tracker-a9563",
  storageBucket: "form-tracker-a9563.firebasestorage.app",
  messagingSenderId: "254905246137",
  appId: "1:254905246137:web:e18dd9d5d286f93cdc5668"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = () => signInWithRedirect(auth, provider);
export const checkRedirectResult = () => getRedirectResult(auth);
export const signOutUser = () => signOut(auth);
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);
