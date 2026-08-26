function init() {
  setupEventListeners();
}


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
  form.addEventListener("submit", handleLoginSubmit);
}


async function handleLoginSubmit(event) {
  event.preventDefault();
  const loginUserData = getLoginFormValues();
  if (!isLoginInputValid(loginUserData)) {
    return;
  }
  document.getElementById("loginBtn").disabled = true;
  await attemptLogin(loginUserData);
}


async function attemptLogin(loginUserData) {
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
  const emailEmpty = checkEmailField(loginUserData.email);
  const passwordEmpty = checkPasswordField(loginUserData.password);
  const message = getLoginErrorMessage(emailEmpty, passwordEmpty);
  document.getElementById("loginError").innerText = message;
  return message === "";
}


function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  markFieldError("exampleInputEmail1", isEmpty);
  return isEmpty;
}


function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("exampleInputPassword1", isEmpty);
  return isEmpty;
}


function getLoginErrorMessage(emailEmpty, passwordEmpty) {
  if (emailEmpty && passwordEmpty) {
    return "Check your email and password. Please try again.";
  }
  if (emailEmpty) {
    return "Please fill in Email field.";
  }
  if (passwordEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}


function markFieldError(inputId, isEmpty) {
  const input = document.getElementById(inputId);
  if (isEmpty) {
    input.classList.add("input-error");
  } else {
    input.classList.remove("input-error");
  }
}


function getLoginFormValues() {
  const inputEmail = document.getElementById("exampleInputEmail1").value;
  const inputPassword = document.getElementById("exampleInputPassword1").value;
  const loginUserData = {
    email: inputEmail,
    password: inputPassword,
  };
  return loginUserData;
}
