// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLseAn_feXIn9nx5s14G9v3h_DS5X_0mM",
  authDomain: "chatgpt-661fd.firebaseapp.com",
  projectId: "chatgpt-661fd",
  storageBucket: "chatgpt-661fd.appspot.com",
  messagingSenderId: "599445555204",
  appId: "1:599445555204:web:0455cf8bdf2fcf89848d51",
  measurementId: "G-PBZZJGTJ6Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);