// ================================================================
// ANLEITUNG window.getCurrentUser() — wird nach dem Team-Onboarding
// wieder entfernt, dauerhaft steht das in der GitHub-Wiki
// ================================================================
// Um Infos zum eingeloggten User (uid, name, email) für die eigene GUI
// auszulesen: window.getCurrentUser() benutzen. Gibt ein Promise zurück,
// wartet automatisch, bis der Login-Status feststeht — kein eigenes
// Timing-Handling nötig.
//
// Beispiel (muss in einer async function stehen, wegen await):
//   async function meineFunktion() {
//     const user = await window.getCurrentUser();
//     console.log(user.uid, user.name, user.email);
//   }
//
// WICHTIG: getCurrentUser() steckt NICHT in dieser Datei, sondern in
// js/login-status.js — die muss auf der eigenen Seite zusätzlich
// eingebunden sein (mit defer), sonst ist window.getCurrentUser
// undefined:
//   <script type="module" src="./script.js"></script>
//   <script src="./js/login-status.js" defer></script>
//   (Pfad-Prefix "./" bzw. "../" je nach Ordnertiefe der eigenen Seite anpassen)
//
// AUSNAHME: login-status.js NICHT auf index.html/signup.html einbinden —
// die würde nicht eingeloggte Besucher sofort wegleiten, genau die
// Leute, die Login/Registrierung ja erreichen sollen. script.js allein
// (ohne login-status.js) reicht dort.
// ================================================================

// Firebase SDK-Dateien werden selbst gehostet (js/vendor/), nicht per CDN geladen —
// vermeidet, dass beim Laden der Datei die Besucher-IP an Google geht.
import { initializeApp } from "./js/vendor/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
} from "./js/vendor/firebase-auth.js";

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
