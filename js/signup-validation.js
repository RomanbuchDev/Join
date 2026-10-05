/**
 * Prüft alle Formularfelder einzeln und bündelt die Ergebnisse in einem Objekt.
 * @param {Object} signupUserData - Die eingegebenen Formulardaten.
 * @returns {Object} Die Prüfungsergebnisse aller Felder (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked).
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
 * Prüft, ob das Namensfeld leer ist.
 * @param {string} name
 * @returns {boolean}
 */
function checkNameField(name) {
  const isEmpty = name.trim() === "";
  markFieldError("registerName", isEmpty);
  return isEmpty;
}


/**
 * Prüft, ob das Email-Feld leer oder ungültig ist.
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
 * Prüft, ob das Passwort-Feld leer ist.
 * @param {string} password
 * @returns {boolean}
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("registerPassword", isEmpty);
  return isEmpty;
}


/**
 * Prüft, ob die Bestätigung leer ist oder nicht mit dem Passwort übereinstimmt.
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
 * Baut den passenden Fehlertext aus den gebündelten Prüfungsergebnissen zusammen.
 * @param {Object} checks - Ergebnis von getSignupFieldChecks() (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked).
 * @returns {string} Die anzuzeigende Fehlermeldung.
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
 * Prüft, ob Name, Email, Passwort und Bestätigung alle leer sind.
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
 * Baut den Fehlertext für das Namensfeld.
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
 * Baut den Fehlertext für das Email-Feld.
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
 * Baut den Fehlertext für das Passwort-Feld.
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
 * Baut den Fehlertext für die Passwort-Bestätigung.
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
 * Setzt oder entfernt die Fehler-Markierung an einem Eingabefeld.
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


/**
 * Prüft, ob die Datenschutz-Checkbox angehakt ist.
 * @param {boolean} isChecked
 * @returns {boolean}
 */
function checkPrivacyField(isChecked) {
  const isUnchecked = !isChecked;
  markFieldError("privacyCheckField", isUnchecked);
  return isUnchecked;
}


/**
 * Baut den Fehlertext für die Datenschutz-Checkbox.
 * @param {boolean} isUnchecked
 * @returns {string}
 */
function getPrivacyErrorMessage(isUnchecked) {
  if (isUnchecked) {
    return "Please accept the privacy policy.";
  }
  return "";
}
