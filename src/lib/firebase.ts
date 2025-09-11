// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "mycampusconnect-8pnsb",
  "appId": "1:179640446424:web:5ba3dc5611dbaf0f9a96ad",
  "storageBucket": "mycampusconnect-8pnsb.firebasestorage.app",
  "apiKey": "AIzaSyAYeI2XhUulklzFWQBNwHpbgfeZL4BeUe4",
  "authDomain": "mycampusconnect-8pnsb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "179640446424"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
