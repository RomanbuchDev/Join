setTimeout(() => {
  window.location.href = "./summary.html";
}, 3000);

/**
 * Startet die Begrüßung, sobald der eingeloggte User feststeht.
 */
async function initGreeting() {
  const user = await window.getCurrentUser();
  greetingUser(user);
}

/**
 * Zeigt die passende Begrüßung (Gast oder mit Namen) an.
 * @param {Object} user - Der eingeloggte User ({ uid, name, email } bzw. Gast-Objekt).
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
