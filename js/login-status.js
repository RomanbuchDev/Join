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
  if (user.isAnonymous) {
    window.currentUser = { uid: user.uid, name: "Guest", isGuest: true };
    window.dispatchEvent(new Event("authReady"));
    return;
  }
  loadCurrentUserProfile(user);
}

/** Lädt die Profildaten (Name) des eingeloggten Users aus der Realtime Database, macht sie global über window.currentUser verfügbar und feuert danach das authReady-Event, damit andere Seiten (z.B. greeting-page.js) darauf reagieren können. @param {Object} user - Das Firebase-User-Objekt (uid, email). */
async function loadCurrentUserProfile(user) {
  const idToken = await user.getIdToken();
  const response = await fetch(
    `${window.firebaseUrl}users/${user.uid}.json?auth=${idToken}`,
  );
  const profile = await response.json();
  window.currentUser = {
    uid: user.uid,
    name: profile.name,
    email: user.email,
  };
  window.dispatchEvent(new Event("authReady"));
}

/** Gibt den eingeloggten User zurück, sobald er feststeht — direkt, falls window.currentUser schon gesetzt ist, sonst wartet die Funktion automatisch auf das authReady-Event. Für andere Seiten gedacht, die uid/name/email für die eigene GUI brauchen (z.B. Header, Avatar-Initialen), ohne sich selbst um das authReady-Timing kümmern zu müssen. @returns {Promise<Object>} Der eingeloggte User ({ uid, name, email } bzw. { uid, name: "Guest", isGuest: true }). */
function getCurrentUser() {
  return new Promise((resolve) => {
    if (window.currentUser) {
      resolve(window.currentUser);
      return;
    }
    window.addEventListener("authReady", () => resolve(window.currentUser), {
      once: true,
    });
  });
}

/** Meldet den eingeloggten User über Firebase Auth ab und leitet danach zur Login-Seite weiter. */
async function handleLogoutClick() {
  await window.signOut(window.auth);
  window.location.href = "../index.html";
}

const logoutButton = document.querySelector(".user-menu-logout");
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogoutClick);
}

window.getCurrentUser = getCurrentUser;

window.onAuthStateChanged(window.auth, handleAuthStateChange);
