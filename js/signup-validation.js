// #region FIELD CHECKS

/**
 * Checks every form field individually and bundles the results into one object.
 * @param {Object} signupUserData - The entered form data.
 * @returns {Object} The check results for all fields (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked).
 */
function getSignupFieldChecks(signupUserData) {
  return {
    nameEmpty: checkNameField(signupUserData.name),
    emailCheck: checkEmailField(signupUserData.email),
    passwordEmpty: checkPasswordField(signupUserData.password),
    confirmCheck: checkConfirmPasswordField(
      signupUserData.password,
      signupUserData.confirmPassword,
    ),
    privacyUnchecked: checkPrivacyField(signupUserData.privacyChecked),
  };
}


/**
 * Checks whether name, email, password, and confirm-password are all filled in (no marking).
 * @returns {boolean}
 */
function areRequiredFieldsFilled() {
  return (
    getFieldValue("registerName").trim() !== "" &&
    getFieldValue("registerEmail").trim() !== "" &&
    getFieldValue("registerPassword").trim() !== "" &&
    getFieldValue("registerConfirmPassword").trim() !== ""
  );
}


/**
 * Checks whether name, email, password, and confirm-password are all empty.
 * @returns {boolean}
 */
function areAllRequiredFieldsEmpty() {
  return (
    getFieldValue("registerName").trim() === "" &&
    getFieldValue("registerEmail").trim() === "" &&
    getFieldValue("registerPassword").trim() === "" &&
    getFieldValue("registerConfirmPassword").trim() === ""
  );
}


/**
 * Checks whether the name field is empty.
 * @param {string} name
 * @returns {boolean}
 */
function checkNameField(name) {
  const isEmpty = name.trim() === "";
  markFieldError("registerName", isEmpty);
  return isEmpty;
}


/**
 * Checks whether the email field is empty or invalid.
 * @param {string} email
 * @returns {{isEmpty: boolean, isInvalid: boolean}}
 */
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("registerEmail", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}


/**
 * Checks whether the password field is empty.
 * @param {string} password
 * @returns {boolean}
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("registerPassword", isEmpty);
  return isEmpty;
}


/**
 * Checks whether the confirmation is empty or doesn't match the password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{isEmpty: boolean, isMismatch: boolean}}
 */
function checkConfirmPasswordField(password, confirmPassword) {
  const isEmpty = confirmPassword.trim() === "";
  const isMismatch = !isEmpty && confirmPassword !== password;
  markFieldError("registerConfirmPassword", isEmpty || isMismatch);
  return { isEmpty, isMismatch };
}


/**
 * Checks whether the privacy checkbox is checked.
 * @param {boolean} isChecked
 * @returns {boolean}
 */
function checkPrivacyField(isChecked) {
  const isUnchecked = !isChecked;
  markFieldError("privacyCheckField", isUnchecked);
  return isUnchecked;
}


/**
 * Checks whether the form is ready to submit and shows a message if not.
 * @returns {boolean}
 */
function isSignupReadyToSubmit() {
  if (!areRequiredFieldsFilled()) {
    showFieldBlurMessage("Please fill in all fields.");
    return false;
  }
  if (!document.getElementById("privacyCheck").checked) {
    showFieldBlurMessage(getPrivacyErrorMessage(true));
    return false;
  }
  return true;
}

// #endregion

// #region ERROR MESSAGES

/**
 * Builds the matching error text from the bundled check results.
 * @param {Object} checks - Result of getSignupFieldChecks() (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked).
 * @returns {string} The error message to display.
 */
function getSignupErrorMessage(checks) {
  if (areAllSignupFieldsEmpty(checks)) {
    return "Please fill in all fields.";
  }
  const messages = [
    getNameErrorMessage(checks.nameEmpty),
    getEmailErrorMessage(checks.emailCheck),
    getPasswordErrorMessage(checks.passwordEmpty),
    getConfirmPasswordErrorMessage(checks.confirmCheck),
    getPrivacyErrorMessage(checks.privacyUnchecked),
  ];
  return messages.find((message) => message) || "";
}


/**
 * Checks whether name, email, password, and confirmation are all empty.
 * @param {Object} checks
 * @returns {boolean}
 */
function areAllSignupFieldsEmpty(checks) {
  return (
    checks.nameEmpty &&
    checks.emailCheck.isEmpty &&
    checks.passwordEmpty &&
    checks.confirmCheck.isEmpty
  );
}


/**
 * Builds the error text for the name field.
 * @param {boolean} nameEmpty
 * @returns {string}
 */
function getNameErrorMessage(nameEmpty) {
  if (nameEmpty) {
    return "Please fill in Name field.";
  }
  return "";
}


/**
 * Builds the error text for the email field.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck
 * @returns {string}
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
 * @param {boolean} isEmpty
 * @returns {string}
 */
function getPasswordErrorMessage(isEmpty) {
  if (isEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}


/**
 * Builds the error text for the password confirmation.
 * @param {{isEmpty: boolean, isMismatch: boolean}} confirmCheck
 * @returns {string}
 */
function getConfirmPasswordErrorMessage(confirmCheck) {
  if (confirmCheck.isEmpty) {
    return "Please confirm your password.";
  }
  if (confirmCheck.isMismatch) {
    return "Passwords do not match.";
  }
  return "";
}


/**
 * Builds the error text for the privacy checkbox.
 * @param {boolean} isUnchecked
 * @returns {string}
 */
function getPrivacyErrorMessage(isUnchecked) {
  if (isUnchecked) {
    return "Please accept the privacy policy.";
  }
  return "";
}

// #endregion

// #region FIELD BLUR MESSAGES

/**
 * Registers a blur listener that checks a field and shows its error message.
 * @param {string} elementId
 * @param {Function} checkFn - Field check function (e.g. checkNameField).
 * @param {Function} messageFn - Matching error-message function.
 */
function addFieldBlurListener(elementId, checkFn, messageFn) {
  document.getElementById(elementId).addEventListener("blur", () => {
    showFieldBlurMessage(messageFn(checkFn(getFieldValue(elementId))));
  });
}


/**
 * Shows the matching error message for the confirm-password field on blur.
 */
function handleConfirmPasswordBlur() {
  const confirmCheck = checkConfirmPasswordField(
    getFieldValue("registerPassword"),
    getFieldValue("registerConfirmPassword"),
  );
  showFieldBlurMessage(getConfirmPasswordErrorMessage(confirmCheck));
}


/**
 * Shows a field's error message, or the general "fill in all fields"
 * message if all required fields are still empty.
 * @param {string} message
 */
function showFieldBlurMessage(message) {
  const text = areAllRequiredFieldsEmpty() ? "Please fill in all fields." : message;
  document.getElementById("signupError").innerText = text;
}


/**
 * Registers blur listeners on all required fields that show the matching
 * error message without affecting the submit button.
 */
function setupFieldBlurMessages() {
  addFieldBlurListener("registerName", checkNameField, getNameErrorMessage);
  addFieldBlurListener("registerEmail", checkEmailField, getEmailErrorMessage);
  addFieldBlurListener("registerPassword", checkPasswordField, getPasswordErrorMessage);
  document.getElementById("registerConfirmPassword").addEventListener("blur", handleConfirmPasswordBlur);
}

// #endregion

// #region MARK FIELDS

/**
 * Sets or removes the error marking on an input field.
 * @param {string} inputId
 * @param {boolean} isEmpty
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
