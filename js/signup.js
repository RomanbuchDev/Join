/**
 * Startet das Setup, sobald die Seite geladen ist.
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
 * Registriert alle Event-Listener für die Signup-Seite (Formular-Submit, Sichtbarkeits-Icon, Zustand zurücksetzen).
 */
function setupEventListeners() {
  const form = document.getElementById("signupForm");
  signupEventListener(form);
  resetSignupFormState();
  visibilityEventListener("registerPassword", "visibility-icon-password");
  inputPasswordCheck("registerPassword", "visibility-icon-password");
  visibilityEventListener("registerConfirmPassword", "visibility-icon-confirm");
  inputPasswordCheck("registerConfirmPassword", "visibility-icon-confirm");
  const requiredFieldIds = [
    "registerName",
    "registerEmail",
    "registerPassword",
    "registerConfirmPassword",
  ];
  requiredFieldIds.forEach((id) => {
    document
      .getElementById(id)
      .addEventListener("input", updateSignupButtonState);
  });
  document
    .getElementById("privacyCheck")
    .addEventListener("change", updateSignupButtonState);
}

/**
 * Reagiert auf das Absenden des Signup-Formulars.
 * @param {HTMLFormElement} form - Das Signup-Formular-Element.
 */
function signupEventListener(form) {
  form.addEventListener("submit", handleSignupSubmit);
}

/**
 * Wechselt das Schloss-Icon, je nachdem ob das Passwort-Feld leer ist oder nicht.
 * @param {string} inputId - Die ID des Passwort-Eingabefelds.
 * @param {string} iconId - Die ID des zugehörigen Sichtbarkeits-Icons.
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
 * Reagiert auf Klicks auf das Sichtbarkeits-Icon.
 * @param {string} inputId - Die ID des Passwort-Eingabefelds.
 * @param {string} iconId - Die ID des zugehörigen Sichtbarkeits-Icons.
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
 * Schaltet zwischen sichtbarem und verstecktem Passwort um (inkl. Icon-Austausch).
 * @param {HTMLImageElement} icon - Das Sichtbarkeits-Icon.
 * @param {HTMLInputElement} inputPasswordCheck - Das Passwort-Eingabefeld.
 * @param {string} iconId - Die ID des Sichtbarkeits-Icons (zum erneuten Abrufen nach dem Wechsel).
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
 * Verarbeitet das Absenden des Formulars: liest die Werte, validiert sie, startet bei Erfolg die Registrierung.
 * @param {SubmitEvent} event - Das Submit-Event des Formulars.
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
 * Versucht die Registrierung mit den eingegebenen Daten durchzuführen.
 * @param {Object} signupUserData - Die eingegebenen Formulardaten (Name, Email, Passwort, Passwort-Bestätigung).
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
    handleSignupError();
    document.getElementById("signup").disabled = false;
  }
}

/**
 * Leitet nach erfolgreicher Registrierung zur Login-Seite weiter — der User soll sich
 * dort selbst einloggen, nicht automatisch angemeldet werden.
 */
function handleSignupSuccess() {
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
}

/**
 * Zeigt eine Fehlermeldung nach fehlgeschlagener Registrierung an.
 */
function handleSignupError() {
  document.getElementById("signupError").innerText =
    "Password or email is incorrect!";
  markFieldError("registerEmail", true);
  markFieldError("registerPassword", true);
}

/**
 * Prüft, ob alle Formulardaten gültig sind, und zeigt ggf. eine Fehlermeldung.
 * @param {Object} signupUserData - Die eingegebenen Formulardaten.
 * @returns {boolean} Ob die Eingaben gültig sind.
 */
function isSignupInputValid(signupUserData) {
  const nameCheck = checkNameField(signupUserData.name);
  const emailCheck = checkEmailField(signupUserData.email);
  const passwordEmpty = checkPasswordField(signupUserData.password);
  const confirmPasswordEmpty = checkConfirmPasswordField(
    signupUserData.password,
    signupUserData.confirmPassword,
  );
  const privacyUnchecked = checkPrivacyField(signupUserData.privacyChecked);
  const message = getSignupErrorMessage(
    nameCheck,
    emailCheck,
    passwordEmpty,
    confirmPasswordEmpty,
    privacyUnchecked,
  );
  document.getElementById("signupError").innerText = message;
  return message === "";
}

/**
 * Prüft, ob das Namensfeld leer ist.
 * @param {string} name - Der eingegebene Name.
 * @returns {boolean} Ob das Feld leer ist.
 */
function checkNameField(name) {
  const isEmpty = name.trim() === "";
  markFieldError("registerName", isEmpty);
  return isEmpty;
}

/**
 * Prüft, ob das Email-Feld leer oder ungültig ist.
 * @param {string} email - Die eingegebene Email-Adresse.
 * @returns {{isEmpty: boolean, isInvalid: boolean}} Ergebnis der Prüfung.
 */
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("registerEmail", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}

/**
 * Prüft, ob das Passwort-Feld leer ist.
 * @param {string} password - Das eingegebene Passwort.
 * @returns {boolean} Ob das Feld leer ist.
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("registerPassword", isEmpty);
  return isEmpty;
}

/**
 * Prüft, ob die Passwort-Bestätigung leer ist oder nicht mit dem Passwort übereinstimmt.
 * @param {string} password - Das eingegebene Passwort.
 * @param {string} confirmPassword - Die eingegebene Passwort-Bestätigung.
 * @returns {{isEmpty: boolean, isMismatch: boolean}} Ergebnis der Prüfung.
 */
function checkConfirmPasswordField(password, confirmPassword) {
  const isEmpty = confirmPassword.trim() === "";
  const isMismatch = !isEmpty && confirmPassword !== password;
  markFieldError("registerConfirmPassword", isEmpty || isMismatch);
  return { isEmpty, isMismatch };
}

/**
 * Baut den passenden Fehlertext aus den Prüfungsergebnissen aller Felder zusammen.
 * @param {boolean} nameEmpty - Ob das Namensfeld leer ist.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - Ergebnis der Email-Prüfung.
 * @param {boolean} passwordEmpty - Ob das Passwort-Feld leer ist.
 * @param {{isEmpty: boolean, isMismatch: boolean}} confirmCheck - Ergebnis der Bestätigungs-Prüfung.
 * @param {boolean} privacyUnchecked - Ob die Datenschutz-Checkbox nicht angehakt ist.
 * @returns {string} Die anzuzeigende Fehlermeldung.
 */
function getSignupErrorMessage(
  nameEmpty,
  emailCheck,
  passwordEmpty,
  confirmCheck,
  privacyUnchecked,
) {
  if (
    nameEmpty &&
    emailCheck.isEmpty &&
    passwordEmpty &&
    confirmCheck.isEmpty
  ) {
    return "Please fill in all fields.";
  }
  const messages = [
    getNameErrorMessage(nameEmpty),
    getEmailErrorMessage(emailCheck),
    getPasswordErrorMessage(passwordEmpty),
    getConfirmPasswordErrorMessage(confirmCheck),
    getPrivacyErrorMessage(privacyUnchecked),
  ];
  return messages.find((message) => message) || "";
}

/**
 * Baut den Fehlertext für das Namensfeld.
 * @param {boolean} nameEmpty - Ob das Namensfeld leer ist.
 * @returns {string} Fehlertext oder leerer String, wenn kein Fehler vorliegt.
 */
function getNameErrorMessage(nameEmpty) {
  if (nameEmpty) {
    return "Please fill in Name field.";
  }
  return "";
}

/**
 * Baut den Fehlertext für das Email-Feld.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - Ergebnis der Email-Prüfung.
 * @returns {string} Fehlertext oder leerer String, wenn kein Fehler vorliegt.
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
 * @param {boolean} isEmpty - Ob das Passwort-Feld leer ist.
 * @returns {string} Fehlertext oder leerer String, wenn kein Fehler vorliegt.
 */
function getPasswordErrorMessage(isEmpty) {
  if (isEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}

/**
 * Baut den Fehlertext für die Passwort-Bestätigung.
 * @param {{isEmpty: boolean, isMismatch: boolean}} confirmCheck - Ergebnis der Bestätigungs-Prüfung.
 * @returns {string} Fehlertext oder leerer String, wenn kein Fehler vorliegt.
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
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {boolean} isEmpty - Ob das Feld als fehlerhaft markiert werden soll.
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
 * Liest Name, Email, Passwort und Passwort-Bestätigung aus dem Formular aus.
 * @returns {Object} Die eingegebenen Formulardaten.
 */
function getSignupFormValues() {
  const inputName = document.getElementById("registerName").value;
  const inputEmail = document.getElementById("registerEmail").value;
  const inputPassword = document.getElementById("registerPassword").value;
  const inputConfirmPassword = document.getElementById(
    "registerConfirmPassword",
  ).value;
  const privacyChecked = document.getElementById("privacyCheck").checked;
  const signupUserData = {
    name: inputName,
    email: inputEmail,
    password: inputPassword,
    confirmPassword: inputConfirmPassword,
    privacyChecked: privacyChecked,
  };
  return signupUserData;
}

/**
 * Setzt Button- und Fehlerzustand zurück, wenn die Seite (erneut) angezeigt wird.
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
 * Aktiviert oder deaktiviert den Sign-up-Button anhand des Datenschutz-Checkbox-Status.
 */
function updateSignupButtonState() {
  const checkboxChecked = document.getElementById("privacyCheck").checked;
  document.getElementById("signup").disabled = !checkboxChecked;
}

/**
 * Prüft, ob die Datenschutz-Checkbox angehakt ist.
 * @param {boolean} isChecked - Ob die Checkbox angehakt ist.
 * @returns {boolean} Ob die Checkbox NICHT angehakt ist (Fehlerfall).
 */
function checkPrivacyField(isChecked) {
  const isUnchecked = !isChecked;
  markFieldError("privacyCheckField", isUnchecked);
  return isUnchecked;
}

/**
 * Baut den Fehlertext für die Datenschutz-Checkbox.
 * @param {boolean} isUnchecked - Ob die Checkbox nicht angehakt ist.
 * @returns {string} Fehlertext oder leerer String, wenn kein Fehler vorliegt.
 */
function getPrivacyErrorMessage(isUnchecked) {
  if (isUnchecked) {
    return "Please accept the privacy policy.";
  }
  return "";
}

init();
