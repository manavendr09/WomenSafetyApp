import {initializeApp} from "firebase/app"
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyCDGPZk78NR4fJa6nlSLDEn1oGwOo46FsI",
    authDomain: "project-1-b05f6.firebaseapp.com",
    projectId: "project-1-b05f6",
    storageBucket: "project-1-b05f6.firebasestorage.app",
    messagingSenderId: "784504248110",
    appId: "1:784504248110:web:efef40e52a2ff8e3290cbf",
    measurementId: "G-G4SLTEEVP1"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
export const functions = getFunctions(app);
export {app,auth,db,messaging};
