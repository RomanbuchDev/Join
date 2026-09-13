import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqzMjMR3tovxxV8gao0Up7JaYSZ4nJwc8",
  authDomain: "join-7252c.firebaseapp.com",
  databaseURL:
    "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-7252c",
  messagingSenderId: "103364081217",
  appId: "1:103364081217:web:76f0c6cf56e2c3acd4f8c0",
};

const app = initializeApp(firebaseConfig);
window.auth = getAuth(app);
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInAnonymously = signInAnonymously;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
window.firebaseUrl =
  "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/";
