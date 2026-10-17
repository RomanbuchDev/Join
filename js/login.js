/**
 * Starts the setup as soon as the page has loaded.
 */
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

/**
 * Registers all event listeners for the login page.
 */
function setupEventListeners() {
  const form = document.getElementById("loginForm");
  const formGuest = document.getElementById("guestLoginBtn");
  loginEventListener(form);
  guestLoginEventListener(formGuest);
  resetLoginFormState();
  visibilityEventListener();
  inputPasswordCheck();
}


/**
 * Reacts to the login form being submitted.
 * @param {HTMLFormElement} form - The login form element.
 */
function loginEventListener(form) {
  form.addEventListener("submit", handleLoginSubmit);
}


/**
 * Switches the lock icon depending on whether the password field is empty or not.
 */
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


/**
 * Reacts to clicks on the visibility icon.
 */
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


/**
 * Toggles between visible and hidden password (including icon swap).
 * @param {HTMLImageElement} icon - The visibility icon.
 * @param {HTMLInputElement} inputPasswordCheck - The password input field.
 */
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


/**
 * Processes the form submission: reads the values, validates them, starts the login on success.
 * @param {SubmitEvent} event - The form's submit event.
 */
async function handleLoginSubmit(event) {
  event.preventDefault();
  const loginUserData = getLoginFormValues();
  if (!isLoginInputValid(loginUserData)) {
    return;
  }
  document.getElementById("loginBtn").disabled = true;
  await attemptLogin(loginUserData);
}


/**
 * Attempts to log in with the entered data.
 * @param {Object} loginUserData - The entered form data (email, password).
 */
async function attemptLogin(loginUserData) {
  try {
    await loginWithEmail(loginUserData.email, loginUserData.password);
    handleLoginSuccess();
  } catch (error) {
    handleLoginError();
    document.getElementById("loginBtn").disabled = false;
  }
}


/**
 * Reacts to clicks on the guest login button.
 * @param {HTMLButtonElement} formGuest - The guest login button.
 */
function guestLoginEventListener(formGuest) {
  formGuest.addEventListener("click", async function (event) {
    event.preventDefault();
    document.getElementById("guestLoginBtn").disabled = true;
    await loginAsGuest();
    handleLoginSuccess();
  });
}


/**
 * Redirects after a successful login — Firebase Auth manages the session itself.
 */
function handleLoginSuccess() {
  setTimeout(() => {
    window.location.href = "./html/greeting-page.html";
  }, 1500);
}


/**
 * Shows an error message after a failed login.
 */
function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
  markFieldError("exampleInputEmail1", true);
  markFieldError("exampleInputPassword1", true);
}


/**
 * Checks whether the entered login data is valid and shows an error message if not.
 * @param {Object} loginUserData - The entered form data.
 * @returns {boolean} Whether the input is valid.
 */
function isLoginInputValid(loginUserData) {
  const emailCheck = checkEmailField(loginUserData.email);
  const passwordEmpty = checkPasswordField(loginUserData.password);
  const message = getLoginErrorMessage(emailCheck, passwordEmpty);
  document.getElementById("loginError").innerText = message;
  return message === "";
}


/**
 * Checks whether the email field is empty or invalid.
 * @param {string} email - The entered email address.
 * @returns {{isEmpty: boolean, isInvalid: boolean}} The check result.
 */
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("exampleInputEmail1", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}


/**
 * Checks whether the password field is empty.
 * @param {string} password - The entered password.
 * @returns {boolean} Whether the field is empty.
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("exampleInputPassword1", isEmpty);
  return isEmpty;
}


/**
 * Builds the matching error text from the email/password checks.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - The email check result.
 * @param {boolean} passwordEmpty - Whether the password field is empty.
 * @returns {string} The error message to display.
 */
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


/**
 * Builds the error text for the email field.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - The email check result.
 * @returns {string} Error text, or an empty string if there is no error.
 */
function getEmailErrorMessage(emailCheck) {
  if (emailCheck.isEmpty) {
    return "Please fill in Email field.";
  }
  if (emailCheck.isInvalid) {
    return "Please enter a valid email address.";
  }
  return "";
}


/**
 * Builds the error text for the password field.
 * @param {boolean} isEmpty - Whether the password field is empty.
 * @returns {string} Error text, or an empty string if there is no error.
 */
function getPasswordErrorMessage(isEmpty) {
  if (isEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}


/**
 * Sets or removes the error marking on an input field.
 * @param {string} inputId - The ID of the input field.
 * @param {boolean} isEmpty - Whether the field should be marked as invalid.
 */
function markFieldError(inputId, isEmpty) {
  const input = document.getElementById(inputId);
  if (isEmpty) {
    input.classList.add("input-error");
  } else {
    input.classList.remove("input-error");
  }
}


/**
 * Reads email and password from the form.
 * @returns {Object} The entered form data.
 */
function getLoginFormValues() {
  const inputEmail = document.getElementById("exampleInputEmail1").value;
  const inputPassword = document.getElementById("exampleInputPassword1").value;
  const loginUserData = {
    email: inputEmail,
    password: inputPassword,
  };
  return loginUserData;
}


/**
 * Resets the button and error state when the page is (re-)shown.
 */
function resetLoginFormState() {
  document.getElementById("loginBtn").disabled = false;
  document.getElementById("guestLoginBtn").disabled = false;
  markFieldError("exampleInputEmail1", false);
  markFieldError("exampleInputPassword1", false);
  document.getElementById("loginError").innerText = "";
}

init();
