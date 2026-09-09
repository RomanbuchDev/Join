// Firebase SDK-Dateien werden selbst gehostet (js/vendor/), nicht per CDN geladen —
// vermeidet, dass beim Laden der Datei die Besucher-IP an Google geht.
import { initializeApp } from "./js/vendor/firebase-app.js";
import { getAuth } from "./js/vendor/firebase-auth.js";
import { createUserWithEmailAndPassword } from "./js/vendor/firebase-auth.js";
import { signInWithEmailAndPassword } from "./js/vendor/firebase-auth.js";
import { signInAnonymously } from "./js/vendor/firebase-auth.js";
import { onAuthStateChanged } from "./js/vendor/firebase-auth.js";

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

// Diese Datei ist ein Modul, die restlichen Scripts (signup.js, auth-service.js, ...)
// sind klassische Scripts und können nicht importieren — deshalb werden auth und die
// gebrauchten SDK-Funktionen hier bewusst an window gehängt, um sie für die restlichen
// Dateien nutzbar zu machen.
window.auth = getAuth(app);
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInAnonymously = signInAnonymously;
window.onAuthStateChanged = onAuthStateChanged;
window.firebaseUrl =
  "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/";
