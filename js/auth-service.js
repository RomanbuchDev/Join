/**
 * Checks email and password against Firebase Auth and then loads the profile from the database.
 * @param {string} email - The entered email address.
 * @param {string} password - The entered password.
 * @returns {Promise<Object>} The logged-in user object ({ uid, name, email }).
 */
async function loginWithEmail(email, password) {
  const userCredential = await window.signInWithEmailAndPassword(
    window.auth,
    email,
    password,
  );
  const user = userCredential.user;
  const idToken = await user.getIdToken();
  const response = await fetch(
    `${window.firebaseUrl}users/${user.uid}.json?auth=${idToken}`,
  );
  const profile = await response.json();
  return { uid: user.uid, name: profile.name, email: user.email };
}


/**
 * Signs in an anonymous guest user via Firebase Anonymous Authentication.
 * @returns {Promise<Object>} The guest user object ({ name, uid, isGuest }).
 */
async function loginAsGuest() {
  const userCredential = await window.signInAnonymously(window.auth);
  const user = userCredential.user;
  return { name: "Guest", uid: user.uid, isGuest: true };
}


/**
 * Creates a new Firebase Auth account and saves the profile (without password) in the database.
 * @param {string} name - The name of the new user.
 * @param {string} email - The email address for the new account.
 * @param {string} password - The password for the new account.
 * @returns {Promise<Object>} The newly registered user object ({ uid, name, email }).
 */
async function registerWithEmail(name, email, password) {
  const userCredential = await window.createUserWithEmailAndPassword(
    window.auth,
    email,
    password,
  );
  const uid = userCredential.user.uid;
  const idToken = await userCredential.user.getIdToken();
  await saveUserProfile(uid, { name, email }, idToken);
  return { uid, name, email };
}


/**
 * Saves the profile (without password) under /users/{uid} in the Realtime Database.
 * @param {string} uid - The user's Firebase Auth uid.
 * @param {Object} profile - The profile data ({ name, email }).
 * @param {string} idToken - The Firebase ID token for the authenticated request.
 */
async function saveUserProfile(uid, profile, idToken) {
  await fetch(`${window.firebaseUrl}users/${uid}.json?auth=${idToken}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}
