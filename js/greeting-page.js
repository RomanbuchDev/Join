setTimeout(() => {
  window.location.href = "./summary.html";
}, 3000);

/**
 * Startet die Begrüßung, sobald der eingeloggte User feststeht — entweder sofort,
 * falls window.currentUser schon gesetzt ist, oder sobald das authReady-Event feuert.
 */
function initGreeting() {
  if (window.currentUser) {
    greetingUser();
    return;
  }
  window.addEventListener("authReady", greetingUser);
}

/**
 * Zeigt die passende Begrüßung (Gast oder mit Namen) anhand von window.currentUser an.
 */
function greetingUser() {
  if (window.currentUser.isGuest) {
    document.getElementById("greetingMessage").innerText = "Good morning!";
    document.getElementById("userName").innerText = "";
  } else {
    document.getElementById("greetingMessage").innerText = "Good morning,";
    document.getElementById("userName").innerText = window.currentUser.name;
  }
}
