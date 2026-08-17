function init() {
  setupEventListeners();
}
window.addEventListener("pageshow", () => {
  document.getElementById("loginToast").classList.remove("show");
});

document.querySelector(".splash-logo").addEventListener("animationend", () => {
  document.getElementById("splashScreen").style.display = "none";
});

function setupEventListeners() {
  const form = document.getElementById("loginForm");
  const formGuest = document.getElementById("guestLoginBtn");
  loginEventListener(form);
  guestLoginEventListener(formGuest);
}

function loginEventListener(form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const loginUserData = getLoginFormValues();
    if (!isLoginInputValid(loginUserData)) {
      return;
    }
    document.getElementById("loginBtn").disabled = true;
    try {
      const user = await loginWithEmail(
        loginUserData.email,
        loginUserData.password,
      );
      handleLoginSuccess(user);
    } catch (error) {
      handleLoginError();
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
  });
}

function handleLoginSuccess(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: user.name, isGuest: user.isGuest }),
  );
  document.getElementById("loginToast").classList.add("show");
  setTimeout(() => {
    window.location.href = "./html/greeting-page.html";
  }, 1500);
}

function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
  setTimeout(() => {
    document.getElementById("loginError").innerText = "";
  }, 3000);
}

function isLoginInputValid(loginUserData) {
  if (
    loginUserData.email.trim() === "" ||
    loginUserData.password.trim() === ""
  ) {
    document.getElementById("loginError").innerText =
      "Please fill in all fields";
    setTimeout(() => {
      document.getElementById("loginError").innerText = "";
    }, 3000);
    return false;
  }
  return true;
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
