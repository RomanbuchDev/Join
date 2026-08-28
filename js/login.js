// Runs setup once the page loads
function init() {
  setupEventListeners();
}


window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetLoginFormState();
  }
});


document.querySelector(".splash-logo").addEventListener("animationend", () => {
  document.getElementById("splashScreen").style.display = "none";
});


// Attaches all event listeners for the login page
function setupEventListeners() {
  const form = document.getElementById("loginForm");
  const formGuest = document.getElementById("guestLoginBtn");
  loginEventListener(form);
  guestLoginEventListener(formGuest);
  resetLoginFormState();
  visibilityEventListener();
  inputPasswordCheck();
}


// Listens for the login form submit
function loginEventListener(form) {
  form.addEventListener("submit", handleLoginSubmit);
}


function inputPasswordCheck() {
  const inputPasswordCheck = document.getElementById("exampleInputPassword1");
  const icon = document.getElementById("visibility-icon");
  inputPasswordCheck.addEventListener("input", () => {
    if (inputPasswordCheck.value === "") {
      icon.src = "./assets/icons/lock.svg";
      icon.classList.remove("visibility-icon");
      return;
    }
    icon.src = "./assets/icons/visibility_off.svg";
    icon.classList.add("visibility-icon");
  });
}


function visibilityEventListener() {
  const inputPasswordCheck = document.getElementById("exampleInputPassword1");
  const icon = document.getElementById("visibility-icon"); //.getAttribute("src")
  icon.addEventListener("click", () => {
    if (inputPasswordCheck.value === "") {
      inputPasswordCheck.type = "password";
      icon.src = "./assets/icons/lock.svg";
      icon.classList.remove("visibility-icon");
      return;
    }
    visibilityIconSwish(icon, inputPasswordCheck);
  });
}


function visibilityIconSwish(icon, inputPasswordCheck) {
  const iconSrc = icon.getAttribute("src");
  const iconVisibilityOn = "./assets/icons/visibility.svg";
  const iconVisibilityOff = "./assets/icons/visibility_off.svg";
  if (iconSrc === iconVisibilityOn) {
    inputPasswordCheck.type = "password";
    document.getElementById("visibility-icon").src = iconVisibilityOff;
  }
  if (iconSrc === iconVisibilityOff) {
    inputPasswordCheck.type = "text";
    document.getElementById("visibility-icon").src = iconVisibilityOn;
  }
  return;
}


// Handles the login form submit event
async function handleLoginSubmit(event) {
  event.preventDefault();
  const loginUserData = getLoginFormValues();
  if (!isLoginInputValid(loginUserData)) {
    return;
  }
  document.getElementById("loginBtn").disabled = true;
  await attemptLogin(loginUserData);
}


// Tries to log in with the entered data
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


// Listens for the guest login button click
function guestLoginEventListener(formGuest) {
  formGuest.addEventListener("click", async function (event) {
    event.preventDefault();
    document.getElementById("guestLoginBtn").disabled = true;
    const user = await loginAsGuest();
    handleLoginSuccess(user);
  });
}


// Saves the user and redirects after a successful login
function handleLoginSuccess(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: user.name, isGuest: user.isGuest }),
  );
  setTimeout(() => {
    window.location.href = "./html/greeting-page.html";
  }, 1500);
}


// Shows the error message after a failed login
function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
}


// Checks if the entered login data is valid
function isLoginInputValid(loginUserData) {
  const emailCheck = checkEmailField(loginUserData.email);
  const passwordEmpty = checkPasswordField(loginUserData.password);
  const message = getLoginErrorMessage(emailCheck, passwordEmpty);
  document.getElementById("loginError").innerText = message;
  return message === "";
}


// Checks if the email field is empty or invalid
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("exampleInputEmail1", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}


// Checks if the password field is empty
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("exampleInputPassword1", isEmpty);
  return isEmpty;
}


// Builds the error message text out of the email and password checks
function getLoginErrorMessage(emailCheck, passwordEmpty) {
  if (emailCheck.isEmpty && passwordEmpty) {
    return "Check your email and password. Please try again.";
  }
  const emailMessage = getEmailErrorMessage(emailCheck);
  if (emailMessage) {
    return emailMessage;
  }
  return getPasswordErrorMessage(passwordEmpty);
}


// Builds the error message text for the email field
function getEmailErrorMessage(emailCheck) {
  if (emailCheck.isEmpty) {
    return "Please fill in Email field.";
  }
  if (emailCheck.isInvalid) {
    return "Please enter a valid email address.";
  }
  return "";
}


// Builds the error message text for the password field
function getPasswordErrorMessage(isEmpty) {
  if (isEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}


// Adds or removes error styling on a field
function markFieldError(inputId, isEmpty) {
  const input = document.getElementById(inputId);
  if (isEmpty) {
    input.classList.add("input-error");
  } else {
    input.classList.remove("input-error");
  }
}


// Reads email and password from the form
function getLoginFormValues() {
  const inputEmail = document.getElementById("exampleInputEmail1").value;
  const inputPassword = document.getElementById("exampleInputPassword1").value;
  const loginUserData = {
    email: inputEmail,
    password: inputPassword,
  };
  return loginUserData;
}


// Resets error styling and buttons after page returns
function resetLoginFormState() {
  document.getElementById("loginBtn").disabled = false;
  document.getElementById("guestLoginBtn").disabled = false;
  markFieldError("exampleInputEmail1", false);
  markFieldError("exampleInputPassword1", false);
  document.getElementById("loginError").innerText = "";
}


init();
