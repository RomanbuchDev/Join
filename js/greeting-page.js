setTimeout(() => {
  window.location.href = "./summary.html";
}, 3000);


/**
 * Starts the greeting as soon as the logged-in user is known.
 */
async function initGreeting() {
  const user = await window.getCurrentUser();
  greetingUser(user);
  initAvatar(user);
}


/**
 * Shows the matching greeting (guest or with the user's name).
 * @param {Object} user - The logged-in user ({ uid, name, email, isGuest }).
 */
function greetingUser(user) {
  if (user.isGuest) {
    document.getElementById("greetingMessage").innerText = "Good morning!";
    document.getElementById("userName").innerText = "";
  } else {
    document.getElementById("greetingMessage").innerText = "Good morning,";
    document.getElementById("userName").innerText = user.name;
  }
}
