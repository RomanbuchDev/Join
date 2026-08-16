function init() {
  setupEventListeners();
  //   loginStatus();
}

function setupEventListeners() {
  const form = document.getElementById("loginForm");
  const formGuest = document.getElementById("guestLoginBtn");
  loginEventListener(form);
  guestLoginEventListener(formGuest);
}

function loginEventListener(form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // verhindert Neuladen der Seite
    document.getElementById("loginBtn").disabled = true;
    const loginUserData = getLoginFormValues();
    try {
      const user = await loginWithEmail(
        loginUserData.email,
        loginUserData.password,
      );
      handleLoginSuccess(user);
    } catch (error) {
      handleLoginError();
    } finally {
      document.getElementById("loginBtn").disabled = false;
    }
  });
}

function guestLoginEventListener(formGuest) {
  formGuest.addEventListener("click", async function (event) {
    event.preventDefault();
    document.getElementById("guestLoginBtn").disabled = true;
    const user = await loginAsGuest();
    handleLoginSuccess(user);
    document.getElementById("guestLoginBtn").disabled = false;
  });
}

function handleLoginSuccess(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: user.name, isGuest: user.isGuest }),
  );
  window.location.href = "./html/greeting-page.html";
}

function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
  setTimeout(() => {
    document.getElementById("loginError").innerText = "";
  }, 3000);
}

function getLoginFormValues() {
  let inputEmail = document.getElementById("exampleInputEmail1").value;
  let inputPassword = document.getElementById("exampleInputPassword1").value;
  let loginUserData = {
    email: inputEmail,
    password: inputPassword,
  };
  return loginUserData;
}

// loginStatus kommt später in jede seite rein
function loginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "../index.html";
  }
}
