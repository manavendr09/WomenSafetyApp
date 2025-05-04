import { db } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { auth } from './firebase';

export const saveContactsForUser = async (contacts) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "contacts", user.uid);
  await setDoc(userRef, { contacts });
};

export const getFcmTokenForUser = async (userId) => {
  try {
    const docRef = doc(db, "fcmTokens", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const token = docSnap.data().token;
      console.log("Retrieved FCM token:", token);
      return token;
    } else {
      console.log("No FCM token found for user");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
};

export const storeFcmToken = async (userId, token) => {
  try {
    await setDoc(doc(db, "fcmTokens", userId), {
      token: token,
      timestamp: new Date().toISOString(),
    });
    console.log("FCM token stored successfully");
  } catch (error) {
    console.error("Error storing FCM token:", error);
  }
};

export const getContactsForUser = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const userRef = doc(db, "contacts", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) return [];

  return docSnap.data().contacts || [];
};


export const addCrimeReport = async (lat, lng, type, severity) => {
  try {
    await addDoc(collection(db, "crimes"), {
      location: new GeoPoint(lat, lng),
      type,
      severity,
      timestamp: Timestamp.now()
    });
    console.log("Crime report added");
  } catch (error) {
    console.error("Error adding crime report:", error);
  }
};
