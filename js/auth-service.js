const BASE_URL_AUTH = "./js/mock-auth.json";
const BASE_URL_USERS = "./js/mock-users.json"


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