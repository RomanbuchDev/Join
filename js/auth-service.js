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
  await fetch(`${window.firebaseUrl}users/${uid}.json?auth=${idToken}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  return { uid, name, email };
}
