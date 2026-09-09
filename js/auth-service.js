/**
 * Prüft Email und Passwort gegen Firebase Auth und lädt danach das Profil aus der Datenbank.
 * @param {string} email - Die eingegebene Email-Adresse.
 * @param {string} password - Das eingegebene Passwort.
 * @returns {Promise<Object>} Das eingeloggte User-Objekt ({ uid, name, email }).
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
 * Meldet einen anonymen Gast-User über Firebase Anonymous Authentication an.
 * @returns {Promise<Object>} Das Gast-User-Objekt ({ name, uid, isGuest }).
 */
async function loginAsGuest() {
  const userCredential = await window.signInAnonymously(window.auth);
  const user = userCredential.user;
  return { name: "Guest", uid: user.uid, isGuest: true };
}

/**
 * Legt einen neuen Firebase-Auth-Account an und speichert das Profil (ohne Passwort) in der Datenbank.
 * @param {string} name - Der Name des neuen Users.
 * @param {string} email - Die Email-Adresse für den neuen Account.
 * @param {string} password - Das Passwort für den neuen Account.
 * @returns {Promise<Object>} Das neu registrierte User-Objekt ({ uid, name, email }).
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
 * Speichert das Profil (ohne Passwort) unter /users/{uid} in der Realtime Database.
 * @param {string} uid - Die Firebase-Auth-uid des Users.
 * @param {Object} profile - Die Profildaten ({ name, email }).
 * @param {string} idToken - Das Firebase-ID-Token für die authentifizierte Anfrage.
 */
async function saveUserProfile(uid, profile, idToken) {
  await fetch(`${window.firebaseUrl}users/${uid}.json?auth=${idToken}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}
