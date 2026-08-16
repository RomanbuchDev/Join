const mockUsers = [
  {
    name: "Sara Hoffmann",
    email: "sara.hoffmann@join.de",
    password: "test1234",
  },
  {
    name: "Jonas Becker",
    email: "jonas.becker@join.de",
    password: "test1234",
  },
  {
    name: "Lena Fischer",
    email: "lena.fischer@join.de",
    password: "test1234",
  },
  {
    name: "Max Weber",
    email: "max.weber@join.de",
    password: "test1234",
  },
  {
    name: "Anna Schmidt",
    email: "anna.schmidt@join.de",
    password: "test1234",
  },
];

/**
 * Checks email and password against the mock user list.
 * @param {string} email - The entered email address.
 * @param {string} password - The entered password.
 * @returns {Promise<Object>} The matching user on success.
 * @throws {Error} If email/password do not match.
 */
async function loginWithEmail(email, password) {
  let user = mockUsers.find(function (u) {
    return u.email === email && u.password === password;
  });
  console.log(user);

  if (user) {
    return user;
  } else {
    throw new Error("Login false");
  }
}

/**
 * Creates a guest user without checking credentials.
 * @returns {Promise<Object>} The guest user object.
 */
async function loginAsGuest() {
  const userGuest = {
    name: "Guest",
    email: "none",
    password: "none",
    isGuest: true,
  };
  console.log(userGuest);
  return userGuest;
}
