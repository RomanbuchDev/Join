const BASE_URL_AUTH = "./js/mock-auth.json";
const BASE_URL_USERS = "./js/mock-users.json";

async function findAuthMatch(email, password) {
  const authFetch = await fetch(BASE_URL_AUTH);
  const authUsers = await authFetch.json();
  return authUsers.find(function (entry) {
    return entry.email === email && entry.password === password;
  });
}

async function findUserProfile(uid) {
  const usersFetch = await fetch(BASE_URL_USERS);
  const usersResponse = await usersFetch.json();
  return usersResponse.find(function (entry) {
    return entry.uid === uid;
  });
}

// Checks email and password against the mock auth data, then loads the matching profile
async function loginWithEmail(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const authMatch = await findAuthMatch(email, password);
  if (!authMatch) {
    throw new Error("Login false");
  }
  const profile = await findUserProfile(authMatch.uid);
  return { name: profile.name, email: authMatch.email };
}

// Creates a guest user without checking credentials
async function loginAsGuest() {
  const userGuest = {
    name: "Guest",
    email: "none",
    password: "none",
    isGuest: true,
  };
  return userGuest;
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

async function findRegisterMailMatch(signupUserMailCheck) {
  const authFetch = await fetch(BASE_URL_AUTH);
  const authUsers = await authFetch.json();
  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const dataLocalStorage = JSON.parse(localStorage.getItem("registeredUsers"));
  const authDataBase = authUsers.find(function (entry) {
    return entry.email === signupUserMailCheck.email;
  });

  const authLocalStorage = dataLocalStorage.find(function (entry) {
    return entry.email === signupUserMailCheck.email;
  });

  // return authUsers.find(function (entry) {

  //   return entry.email === signupUserMailCheck.email;
  // });
}
