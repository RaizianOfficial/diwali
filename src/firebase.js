import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Default / Example Firebase Configuration
// Replace these with your project credentials in .env or directly here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForDiwaliMela2026Demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "diwali-mela-3d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "diwali-mela-3d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "diwali-mela-3d.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456"
};

// Initial Festive Mock Data used when offline or before Firebase is linked
export const MOCK_CONTRIBUTORS = [
  { id: '1', name: "Aarav Sharma", amount: 5100, rank: 1, message: "Shubh Deepawali to all!" },
  { id: '2', name: "Priya Patel", amount: 3500, rank: 2, message: "Peace and prosperity 🪔" },
  { id: '3', name: "Vikram Malhotra", amount: 2500, rank: 3, message: "Har Har Mahadev!" },
  { id: '4', name: "Ananya Verma", amount: 2100, rank: 4, message: "Happy Diwali from London" },
  { id: '5', name: "Rohan Mehta", amount: 1500, rank: 5, message: "Love the mela visuals!" },
  { id: '6', name: "Deepak Gupta", amount: 1100, rank: 6, message: "Joy & sweets for everyone" },
  { id: '7', name: "Kavita Rao", amount: 1001, rank: 7, message: "May Goddess Lakshmi bless you" },
  { id: '8', name: "Amitabh Joshi", amount: 750, rank: 8, message: "Festival of Lights ✨" },
  { id: '9', name: "Sneha Kapoor", amount: 501, rank: 9, message: "Jai Shri Ram!" },
  { id: '10', name: "Rajesh Singhania", amount: 500, rank: 10, message: "Happy Diwali!" }
];

let app = null;
let db = null;
let isFirebaseLive = false;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("MockKey")) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseLive = true;
  }
} catch (err) {
  console.warn("Firebase initialization skipped or failed, using local festive store:", err);
  isFirebaseLive = false;
}

/**
 * Fetch Top 10 Contributors once or listen in real-time
 */
export function subscribeToTopContributors(onUpdate) {
  if (!isFirebaseLive || !db) {
    // Deliver mock data immediately
    onUpdate([...MOCK_CONTRIBUTORS]);
    
    // Provide a callback to unsubscribe
    return () => {};
  }

  try {
    const q = query(
      collection(db, "contributors"),
      orderBy("amount", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        onUpdate(MOCK_CONTRIBUTORS);
      } else {
        const list = snapshot.docs.map((doc, idx) => ({
          id: doc.id,
          rank: idx + 1,
          ...doc.data()
        }));
        onUpdate(list);
      }
    }, (error) => {
      console.warn("Firestore snapshot error, falling back to mock:", error);
      onUpdate(MOCK_CONTRIBUTORS);
    });

    return unsubscribe;
  } catch (error) {
    console.warn("Failed to subscribe to Firestore:", error);
    onUpdate(MOCK_CONTRIBUTORS);
    return () => {};
  }
}

/**
 * Add a new contribution to Firestore
 */
export async function addContributionToFirestore(name, amount, message = "") {
  if (!isFirebaseLive || !db) {
    // Add locally to mock list
    const newEntry = {
      id: 'local-' + Date.now(),
      name,
      amount: Number(amount),
      message,
      createdAt: new Date().toISOString()
    };
    MOCK_CONTRIBUTORS.push(newEntry);
    MOCK_CONTRIBUTORS.sort((a, b) => b.amount - a.amount);
    return { success: true, local: true, entry: newEntry };
  }

  try {
    const docRef = await addDoc(collection(db, "contributors"), {
      name,
      amount: Number(amount),
      message,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Error writing contribution to Firestore:", err);
    throw err;
  }
}

export { db, isFirebaseLive };
