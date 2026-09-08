const firebaseUrl =
  "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Redirect protection for pages that require a login.
 * Usage: add <script src="../js/login-status.js"></script> to the page's <head>.
 * No further setup needed — runs automatically on load.
 */

/**
 * Reagiert auf Änderungen des Login-Status: leitet aus, wenn niemand eingeloggt ist,
 * lädt sonst das Profil des eingeloggten Users nach.
 * @param {Object|null} user - Das Firebase-User-Objekt, oder null wenn ausgeloggt.
 */
function handleAuthStateChange(user) {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  loadCurrentUserProfile(user);
}

/**
 * Lädt die Profildaten (Name) des eingeloggten Users aus der Realtime Database
 * und macht sie global über window.currentUser verfügbar.
 * @param {Object} user - Das Firebase-User-Objekt (uid, email).
 */
async function loadCurrentUserProfile(user) {
  const response = await fetch(`${firebaseUrl}users/${user.uid}.json`);
  const profile = await response.json();
  window.currentUser = {
    uid: user.uid,
    name: profile.name,
    email: user.email,
  };
}

window.onAuthStateChanged(window.auth, handleAuthStateChange);
