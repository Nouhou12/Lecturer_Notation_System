// Firebase initialization module
// Replace the placeholder fields below with your real Firebase project config
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0hp7YXWZH9PV85FwH1sxYZ9ZQnhkCNiA",
    authDomain: "rui-lecturer-notation-system.firebaseapp.com",
    projectId: "rui-lecturer-notation-system",
    storageBucket: "rui-lecturer-notation-system.firebasestorage.app",
    messagingSenderId: "384872145044",
    appId: "1:384872145044:web:f01fce0a321ec2f2d99481",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helpful note: After you replace the config above the site will use
// Firebase Auth and Firestore for auth and notes storage.