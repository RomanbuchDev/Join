const BASE_URL_USERS = "./js/mock-users.json";

async function findAuthMatch(email, password) {
  const usersFetch = await fetch(BASE_URL_USERS);
  const users = await usersFetch.json();
  return users.find(function (entry) {
    return entry.email === email && entry.password === password;
  });
}

// Checks email and password against the mock user data (now one combined file)
async function loginWithEmail(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const authMatch = await findAuthMatch(email, password);
  if (!authMatch) {
    throw new Error("Login false");
  }
  return { name: authMatch.name, email: authMatch.email };
}

// Creates a guest user without checking credentials
async function loginAsGuest() {
  const userCredential = await window.signInAnonymously(window.auth);
  const user = userCredential.user;
  return { name: "Guest", uid: user.uid, isGuest: true };
}

// Saves a new user to localStorage (mock) instead of a real backend for now
async function registerWithEmail(name, email, password) {
  const uid = crypto.randomUUID();
  const newUser = { uid, name, email, password };
  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  registeredUsers.push(newUser);
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
  console.log("Mock-Registrierung:", newUser);
  // Later (Firebase Realtime Database REST API), replace the block above with:
  // const response = await fetch(BASE_URL + "/users/" + uid + ".json", {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(newUser),
  // });
  // return await response.json();
  return { uid, name, email };
}
