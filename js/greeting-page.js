setTimeout(() => {
  window.location.href = "./summary.html";
}, 3000);


function initGreeting() {
  if (!loginStatus()) {
    return;
  }
  greetingUser();
}


function loginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../index.html";
    return false;
  }
  return true;
}


function greetingUser() {
  const greetingUserData = JSON.parse(localStorage.getItem("currentUser"));
  if (greetingUserData.isGuest) {
    document.getElementById("greetingMessage").innerText = "Good morning!";
    document.getElementById("userName").innerText = "";
  } else {
    document.getElementById("greetingMessage").innerText = "Good morning,";
    document.getElementById("userName").innerText = greetingUserData.name;
  }
}
