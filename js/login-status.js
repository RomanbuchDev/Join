/**
 * Redirect protection for pages that require a login.
 * Usage: add <script src="../js/login-status.js"></script> to the page's <head>.
 * No further setup needed — runs automatically on load.
 */

/**
 * Reacts to changes in the login status: redirects if nobody is logged in,
 * otherwise loads the logged-in user's profile.
 * @param {Object|null} user - The Firebase user object, or null if logged out.
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


/**
 * Loads the logged-in user's profile data (name) from the Realtime Database, makes it globally
 * available via window.currentUser, and then fires the authReady event so other pages
 * (e.g. greeting-page.js) can react to it.
 * @param {Object} user - The Firebase user object (uid, email).
 */
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


/**
 * Returns the logged-in user as soon as it is known — directly if window.currentUser is already
 * set, otherwise the function automatically waits for the authReady event. Meant for other pages
 * that need uid/name/email for their own GUI (e.g. header, avatar initials) without having to
 * handle the authReady timing themselves.
 * @returns {Promise<Object>} The logged-in user ({ uid, name, email } or { uid, name: "Guest", isGuest: true }).
 */
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


/**
 * Signs the logged-in user out via Firebase Auth and then redirects to the login page.
 */
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
