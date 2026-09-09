import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";
// Deine JSON-Datei einlesen (Node.js Umgebung)
import tasks from "./tasks.json" with { type: "json" };

// Deine Firebase-Konfiguration
const firebaseConfig = {
  databaseURL: "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function uploadTasks() {
  const tasksRef = ref(db, 'tasks');

  console.log("Starte Upload...");

  for (const task of tasks) {
    // 1. Erzeuge eine neue, eindeutige ID unter 'tasks'
    const newTaskRef = push(tasksRef);
    
    // 2. Schreibe die Daten in diese neue ID
    await set(newTaskRef, task);
    console.log(`Task hochgeladen mit ID: ${newTaskRef.key}`);
  }

  console.log("Fertig! Alle Tasks wurden erfolgreich importiert.");
  process.exit(0);
}

uploadTasks().catch(console.error);
