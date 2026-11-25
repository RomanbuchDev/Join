// #region INIT

/**
 * Starts the setup as soon as the page has loaded.
 */
function init() {
  setupEventListeners();
  window.addEventListener("pageshow", handlePageShow);
}


/**
 * Resets the form when the page is restored from the browser cache (e.g. via the back button).
 * @param {PageTransitionEvent} event - The pageshow event.
 */
function handlePageShow(event) {
  if (event.persisted) {
    resetLoginFormState();
  }
}


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
 * Registers the click handler for the guest login button.
 * @param {HTMLButtonElement} formGuest - The guest login button.
 */
function guestLoginEventListener(formGuest) {
  formGuest.addEventListener("click", handleGuestLoginClick);
}

// #endregion

// #region LOGIN

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
  document.body.classList.add("is-loading");
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
    handleLoginFailure(error);
  }
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
 * Reacts to a failed login attempt depending on the error code, and re-enables the login button.
 * @param {Object} error - The error thrown by loginWithEmail().
 */
function handleLoginFailure(error) {
  if (error.code === "auth/network-request-failed") {
    openDialogConnectionErrorDatabase();
  } else if (error.code === "auth/too-many-requests") {
    document.getElementById("loginError").innerText = "Too many attempts, please try again later.";
  } else {
    handleLoginError();
  }
  document.getElementById("loginBtn").disabled = false;
  document.body.classList.remove("is-loading");
}


/**
 * Shows an error message after a failed login.
 */
function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
  markFieldError("loginEmail", true);
  markFieldError("loginPassword", true);
}

// #endregion

// #region GUEST LOGIN

/**
 * Reacts to a click on the guest login button: logs in as guest and redirects on success.
 * @param {MouseEvent} event - The click event.
 */
async function handleGuestLoginClick(event) {
  try {
    event.preventDefault();
    document.getElementById("guestLoginBtn").disabled = true;
    document.body.classList.add("is-loading");
    await loginAsGuest();
    handleLoginSuccess();
  } catch (error) {
    openDialogConnectionErrorDatabase();
    document.getElementById("guestLoginBtn").disabled = false;
    document.body.classList.remove("is-loading");
  }
}

// #endregion

// #region VALIDATION

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
  markFieldError("loginEmail", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}


/**
 * Checks whether the password field is empty.
 * @param {string} password - The entered password.
 * @returns {boolean} Whether the field is empty.
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("loginPassword", isEmpty);
  return isEmpty;
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

// #endregion

// #region ERROR MESSAGES

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

// #endregion

// #region PASSWORD VISIBILITY

/**
 * Switches the lock icon depending on whether the password field is empty or not.
 */
function inputPasswordCheck() {
  const inputPasswordCheck = document.getElementById("loginPassword");
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
  const inputPasswordCheck = document.getElementById("loginPassword");
  const icon = document.getElementById("visibility-icon");
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

// #endregion

// #region FORM HELPERS

/**
 * Reads email and password from the form.
 * @returns {Object} The entered form data.
 */
function getLoginFormValues() {
  const inputEmail = document.getElementById("loginEmail").value;
  const inputPassword = document.getElementById("loginPassword").value;
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
  markFieldError("loginEmail", false);
  markFieldError("loginPassword", false);
  document.getElementById("loginError").innerText = "";
}

// #endregion

init();
