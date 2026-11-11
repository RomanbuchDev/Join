/**
 * Starts the setup as soon as the page has loaded.
 */
function init() {
  setupEventListeners();
  updateSignupButtonState();
}


window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetSignupFormState();
    updateSignupButtonState();
  }
});


/**
 * Registers all event listeners for the signup page (form submit, visibility icon, resetting state).
 */
function setupEventListeners() {
  const form = document.getElementById("signupForm");
  signupEventListener(form);
  resetSignupFormState();
  setupPasswordVisibilityListeners();
  setupButtonStateListeners();
  setupFieldValidationListeners();
}


/**
 * Attaches an input listener to an element that runs the given callback.
 * @param {string} elementId - The ID of the input element.
 * @param {Function} callback - The function to run on input.
 */
function addFieldListener(elementId, callback) {
  document.getElementById(elementId).addEventListener("input", callback);
}


/**
 * Re-validates the confirm-password field live, using the current values of both password fields.
 */
function validatePasswordFieldsLive() {
  checkConfirmPasswordField(getFieldValue("registerPassword"), getFieldValue("registerConfirmPassword"));
}


/**
 * Registers input listeners on name, email, password and confirm-password so each field's
 * error marking updates live while typing, not just on submit.
 */
function setupFieldValidationListeners() {
  addFieldListener("registerName", () => checkNameField(getFieldValue("registerName")));
  addFieldListener("registerEmail", () => checkEmailField(getFieldValue("registerEmail")));
  addFieldListener("registerPassword", () => {
    checkPasswordField(getFieldValue("registerPassword"));
    validatePasswordFieldsLive();
  });
  addFieldListener("registerConfirmPassword", validatePasswordFieldsLive);
}


/**
 * Registers the visibility icon listeners for both password fields.
 */
function setupPasswordVisibilityListeners() {
  visibilityEventListener("registerPassword", "visibility-icon-password");
  inputPasswordCheck("registerPassword", "visibility-icon-password");
  visibilityEventListener("registerConfirmPassword", "visibility-icon-confirm");
  inputPasswordCheck("registerConfirmPassword", "visibility-icon-confirm");
}


/**
 * Registers listeners on all required fields/the checkbox that recalculate the button state.
 */
function setupButtonStateListeners() {
  const requiredFieldIds = [
    "registerName",
    "registerEmail",
    "registerPassword",
    "registerConfirmPassword",
  ];
  requiredFieldIds.forEach((id) => addButtonStateListener(id, "input"));
  addButtonStateListener("privacyCheck", "change");
}


/**
 * Attaches a listener to an element that recalculates the sign-up button state.
 * @param {string} elementId
 * @param {string} eventType
 */
function addButtonStateListener(elementId, eventType) {
  document
    .getElementById(elementId)
    .addEventListener(eventType, updateSignupButtonState);
}


/**
 * Reacts to the signup form being submitted.
 * @param {HTMLFormElement} form
 */
function signupEventListener(form) {
  form.addEventListener("submit", handleSignupSubmit);
}


/**
 * Switches the lock icon depending on the content of the password field.
 * @param {string} inputId
 * @param {string} iconId
 */
function inputPasswordCheck(inputId, iconId) {
  const inputPasswordCheck = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  inputPasswordCheck.addEventListener("input", () => {
    if (inputPasswordCheck.value === "") {
      icon.src = "../assets/icons/lock.svg";
      icon.classList.remove("visibility-icon");
      return;
    }
    icon.src = "../assets/icons/visibility_off.svg";
    icon.classList.add("visibility-icon");
  });
}


/**
 * Reacts to clicks on the visibility icon.
 * @param {string} inputId
 * @param {string} iconId
 */
function visibilityEventListener(inputId, iconId) {
  const inputPasswordCheck = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  icon.addEventListener("click", () => {
    if (inputPasswordCheck.value === "") {
      inputPasswordCheck.type = "password";
      icon.src = "../assets/icons/lock.svg";
      icon.classList.remove("visibility-icon");
      return;
    }
    visibilityIconSwish(icon, inputPasswordCheck, iconId);
  });
}


/**
 * Toggles between visible and hidden password (including icon swap).
 * @param {HTMLImageElement} icon - The visibility icon.
 * @param {HTMLInputElement} inputPasswordCheck - The password input field.
 * @param {string} iconId - The ID of the visibility icon (to re-fetch it after the swap).
 */
function visibilityIconSwish(icon, inputPasswordCheck, iconId) {
  const iconSrc = icon.getAttribute("src");
  const iconVisibilityOn = "../assets/icons/visibility.svg";
  const iconVisibilityOff = "../assets/icons/visibility_off.svg";
  if (iconSrc === iconVisibilityOn) {
    inputPasswordCheck.type = "password";
    document.getElementById(iconId).src = iconVisibilityOff;
  }
  if (iconSrc === iconVisibilityOff) {
    inputPasswordCheck.type = "text";
    document.getElementById(iconId).src = iconVisibilityOn;
  }
  return;
}


/**
 * Processes the form submission: reads the values, validates them, starts the registration on success.
 * @param {SubmitEvent} event - The form's submit event.
 */
async function handleSignupSubmit(event) {
  event.preventDefault();
  const signupUserData = getSignupFormValues();
  if (!isSignupInputValid(signupUserData)) {
    return;
  }
  document.getElementById("signup").disabled = true;
  await attemptSignup(signupUserData);
}


/**
 * Attempts to register with the entered data.
 * @param {Object} signupUserData - The entered form data (name, email, password, confirm password).
 */
async function attemptSignup(signupUserData) {
  try {
    await registerWithEmail(
      signupUserData.name,
      signupUserData.email,
      signupUserData.password,
    );
    handleSignupSuccess();
  } catch (error) {
    handleSignupError(error);
    document.getElementById("signup").disabled = false;
  }
}


/**
 * Redirects to the login page after a successful registration (no auto-login).
 */
function handleSignupSuccess() {
  document.getElementById("signupToast").classList.add("show");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 3000);
}


/**
 * Builds the error message based on the Firebase error code and marks the affected field.
 * @param {Object} error - The error thrown by Firebase Auth.
 * @returns {string} The error message to display.
 */
function getSignupServerErrorMessage(error) {
  if (error.code === "auth/email-already-in-use") {
    markFieldError("registerEmail", true);
    return "This email address is already registered!";
  } else if (error.code === "auth/weak-password") {
    markFieldError("registerPassword", true);
    return "Password must be at least 6 characters.";
  }
  return "Registration failed. Please try again.";
}


/**
 * Shows an error message after a failed registration.
 */
function handleSignupError(error) {
  document.getElementById("signupError").innerText =
    getSignupServerErrorMessage(error);
}


/**
 * Checks whether all form data is valid and shows an error message if not.
 * @param {Object} signupUserData - The entered form data.
 * @returns {boolean} Whether the input is valid.
 */
function isSignupInputValid(signupUserData) {
  const checks = getSignupFieldChecks(signupUserData);
  const message = getSignupErrorMessage(checks);
  document.getElementById("signupError").innerText = message;
  return message === "";
}


/**
 * Reads name, email, password, confirm password, and the privacy checkbox from the form.
 * @returns {Object}
 */
function getSignupFormValues() {
  return {
    name: getFieldValue("registerName"),
    email: getFieldValue("registerEmail"),
    password: getFieldValue("registerPassword"),
    confirmPassword: getFieldValue("registerConfirmPassword"),
    privacyChecked: document.getElementById("privacyCheck").checked,
  };
}


/**
 * Reads the value of an input field.
 * @param {string} inputId
 * @returns {string}
 */
function getFieldValue(inputId) {
  return document.getElementById(inputId).value;
}


/**
 * Resets the button and error state when the page is (re-)shown.
 */
function resetSignupFormState() {
  document.getElementById("signup").disabled = false;
  markFieldError("registerName", false);
  markFieldError("registerEmail", false);
  markFieldError("registerPassword", false);
  markFieldError("registerConfirmPassword", false);
  markFieldError("privacyCheckField", false);
  document.getElementById("signupError").innerText = "";
}


/**
 * Enables/disables the sign-up button based on the privacy checkbox state.
 */
function updateSignupButtonState() {
  const checkboxChecked = document.getElementById("privacyCheck").checked;
  document.getElementById("signup").disabled = !checkboxChecked;
}


init();
