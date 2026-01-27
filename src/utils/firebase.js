// Firebase configuration for Tary Moda Praia
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDwDz7erCRwsLboeUfhUTvy8VrpeabeEQs",
    authDomain: "tary-moda-praia.firebaseapp.com",
    databaseURL: "https://tary-moda-praia-default-rtdb.firebaseio.com",
    projectId: "tary-moda-praia",
    storageBucket: "tary-moda-praia.firebasestorage.app",
    messagingSenderId: "523748127983",
    appId: "1:523748127983:web:3429801fd74f3fedbad71a",
    measurementId: "G-7E01Q4PWT2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database)
export const db = getFirestore(app);

// Initialize Storage (for images)
export const storage = getStorage(app);

export default app;
