import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";

export const docreateuserwithEmailAndPassword = async (email, password) => {  
  return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInwithEmailAndPassword = async (email, password, rememberMe = false) => {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async (rememberMe = false) => {
  const provider = new GoogleAuthProvider();
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);
  
  const result = await signInWithPopup(auth, provider);
  const user = result.user;  
  const photoURL = user.photoURL;  
  
  console.log("User's photo URL: ", photoURL);
  return result; 
};

export const doSignOut = () => {
  return auth.signOut();
};
