/** Startet das Setup, sobald die Seite geladen ist. */
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

/** Registriert alle Event-Listener für die Signup-Seite (Formular-Submit, Sichtbarkeits-Icon, Zustand zurücksetzen). */
function setupEventListeners() {
  const form = document.getElementById("signupForm");
  signupEventListener(form);
  resetSignupFormState();
  setupPasswordVisibilityListeners();
  setupButtonStateListeners();
}

/** Registriert die Sichtbarkeits-Icon-Listener für beide Passwortfelder. */
function setupPasswordVisibilityListeners() {
  visibilityEventListener("registerPassword", "visibility-icon-password");
  inputPasswordCheck("registerPassword", "visibility-icon-password");
  visibilityEventListener("registerConfirmPassword", "visibility-icon-confirm");
  inputPasswordCheck("registerConfirmPassword", "visibility-icon-confirm");
}

/** Registriert Listener auf allen Pflichtfeldern/der Checkbox, die den Button-Status neu berechnen. */
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

/** Hängt einen Listener an ein Element, der den Sign-up-Button-Status neu berechnet. @param {string} elementId @param {string} eventType */
function addButtonStateListener(elementId, eventType) {
  document
    .getElementById(elementId)
    .addEventListener(eventType, updateSignupButtonState);
}

/** Reagiert auf das Absenden des Signup-Formulars. @param {HTMLFormElement} form */
function signupEventListener(form) {
  form.addEventListener("submit", handleSignupSubmit);
}

/** Wechselt das Schloss-Icon je nach Inhalt des Passwort-Felds. @param {string} inputId @param {string} iconId */
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

/** Reagiert auf Klicks auf das Sichtbarkeits-Icon. @param {string} inputId @param {string} iconId */
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

/** Schaltet zwischen sichtbarem und verstecktem Passwort um (inkl. Icon-Austausch). @param {HTMLImageElement} icon - Das Sichtbarkeits-Icon. @param {HTMLInputElement} inputPasswordCheck - Das Passwort-Eingabefeld. @param {string} iconId - Die ID des Sichtbarkeits-Icons (zum erneuten Abrufen nach dem Wechsel). */
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

/** Verarbeitet das Absenden des Formulars: liest die Werte, validiert sie, startet bei Erfolg die Registrierung. @param {SubmitEvent} event - Das Submit-Event des Formulars. */
async function handleSignupSubmit(event) {
  event.preventDefault();
  const signupUserData = getSignupFormValues();
  if (!isSignupInputValid(signupUserData)) {
    return;
  }
  document.getElementById("signup").disabled = true;
  await attemptSignup(signupUserData);
}

/** Versucht die Registrierung mit den eingegebenen Daten durchzuführen. @param {Object} signupUserData - Die eingegebenen Formulardaten (Name, Email, Passwort, Passwort-Bestätigung). */
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

/** Leitet nach erfolgreicher Registrierung zur Login-Seite weiter (kein Auto-Login). */
function handleSignupSuccess() {
  document.getElementById("signupToast").classList.add("show");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 3000);
}

/** Baut die Fehlermeldung anhand des Firebase-Fehlercodes und markiert das betroffene Feld. @param {Object} error - Der von Firebase Auth geworfene Fehler. @returns {string} Die anzuzeigende Fehlermeldung. */
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

/** Zeigt eine Fehlermeldung nach fehlgeschlagener Registrierung an. */
function handleSignupError(error) {
  document.getElementById("signupError").innerText =
    getSignupServerErrorMessage(error);
}

/** Prüft, ob alle Formulardaten gültig sind, und zeigt ggf. eine Fehlermeldung. @param {Object} signupUserData - Die eingegebenen Formulardaten. @returns {boolean} Ob die Eingaben gültig sind. */
function isSignupInputValid(signupUserData) {
  const checks = getSignupFieldChecks(signupUserData);
  const message = getSignupErrorMessage(checks);
  document.getElementById("signupError").innerText = message;
  return message === "";
}

/** Prüft alle Formularfelder einzeln und bündelt die Ergebnisse in einem Objekt. @param {Object} signupUserData - Die eingegebenen Formulardaten. @returns {Object} Die Prüfungsergebnisse aller Felder (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked). */
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

/** Prüft, ob das Namensfeld leer ist. @param {string} name @returns {boolean} */
function checkNameField(name) {
  const isEmpty = name.trim() === "";
  markFieldError("registerName", isEmpty);
  return isEmpty;
}

/** Prüft, ob das Email-Feld leer oder ungültig ist. @param {string} email @returns {{isEmpty: boolean, isInvalid: boolean}} */
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("registerEmail", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}

/** Prüft, ob das Passwort-Feld leer ist. @param {string} password @returns {boolean} */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("registerPassword", isEmpty);
  return isEmpty;
}

/** Prüft, ob die Bestätigung leer ist oder nicht mit dem Passwort übereinstimmt. @param {string} password @param {string} confirmPassword @returns {{isEmpty: boolean, isMismatch: boolean}} */
function checkConfirmPasswordField(password, confirmPassword) {
  const isEmpty = confirmPassword.trim() === "";
  const isMismatch = !isEmpty && confirmPassword !== password;
  markFieldError("registerConfirmPassword", isEmpty || isMismatch);
  return { isEmpty, isMismatch };
}

/** Baut den passenden Fehlertext aus den gebündelten Prüfungsergebnissen zusammen. @param {Object} checks - Ergebnis von getSignupFieldChecks() (nameEmpty, emailCheck, passwordEmpty, confirmCheck, privacyUnchecked). @returns {string} Die anzuzeigende Fehlermeldung. */
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

/** Prüft, ob Name, Email, Passwort und Bestätigung alle leer sind. @param {Object} checks @returns {boolean} */
function areAllSignupFieldsEmpty(checks) {
  return (
    checks.nameEmpty &&
    checks.emailCheck.isEmpty &&
    checks.passwordEmpty &&
    checks.confirmCheck.isEmpty
  );
}

/** Baut den Fehlertext für das Namensfeld. @param {boolean} nameEmpty @returns {string} */
function getNameErrorMessage(nameEmpty) {
  if (nameEmpty) {
    return "Please fill in Name field.";
  }
  return "";
}

/** Baut den Fehlertext für das Email-Feld. @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck @returns {string} */
function getEmailErrorMessage(emailCheck) {
  if (emailCheck.isEmpty) {
    return "Please fill in Email field.";
  }
  if (emailCheck.isInvalid) {
    return "Please enter a valid email address.";
  }
  return "";
}

/** Baut den Fehlertext für das Passwort-Feld. @param {boolean} isEmpty @returns {string} */
function getPasswordErrorMessage(isEmpty) {
  if (isEmpty) {
    return "Please fill in Password field.";
  }
  return "";
}

/** Baut den Fehlertext für die Passwort-Bestätigung. @param {{isEmpty: boolean, isMismatch: boolean}} confirmCheck @returns {string} */
function getConfirmPasswordErrorMessage(confirmCheck) {
  if (confirmCheck.isEmpty) {
    return "Please confirm your password.";
  }
  if (confirmCheck.isMismatch) {
    return "Passwords do not match.";
  }
  return "";
}

/** Setzt oder entfernt die Fehler-Markierung an einem Eingabefeld. @param {string} inputId @param {boolean} isEmpty */
function markFieldError(inputId, isEmpty) {
  const input = document.getElementById(inputId);
  if (isEmpty) {
    input.classList.add("input-error");
  } else {
    input.classList.remove("input-error");
  }
}

/** Liest Name, Email, Passwort, Bestätigung und Datenschutz-Checkbox aus dem Formular aus. @returns {Object} */
function getSignupFormValues() {
  return {
    name: getFieldValue("registerName"),
    email: getFieldValue("registerEmail"),
    password: getFieldValue("registerPassword"),
    confirmPassword: getFieldValue("registerConfirmPassword"),
    privacyChecked: document.getElementById("privacyCheck").checked,
  };
}

/** Liest den Wert eines Eingabefelds aus. @param {string} inputId @returns {string} */
function getFieldValue(inputId) {
  return document.getElementById(inputId).value;
}

/** Setzt Button- und Fehlerzustand zurück, wenn die Seite (erneut) angezeigt wird. */
function resetSignupFormState() {
  document.getElementById("signup").disabled = false;
  markFieldError("registerName", false);
  markFieldError("registerEmail", false);
  markFieldError("registerPassword", false);
  markFieldError("registerConfirmPassword", false);
  markFieldError("privacyCheckField", false);
  document.getElementById("signupError").innerText = "";
}

/** Aktiviert/deaktiviert den Sign-up-Button anhand des Datenschutz-Checkbox-Status. */
function updateSignupButtonState() {
  const checkboxChecked = document.getElementById("privacyCheck").checked;
  document.getElementById("signup").disabled = !checkboxChecked;
}

/** Prüft, ob die Datenschutz-Checkbox angehakt ist. @param {boolean} isChecked @returns {boolean} */
function checkPrivacyField(isChecked) {
  const isUnchecked = !isChecked;
  markFieldError("privacyCheckField", isUnchecked);
  return isUnchecked;
}

/** Baut den Fehlertext für die Datenschutz-Checkbox. @param {boolean} isUnchecked @returns {string} */
function getPrivacyErrorMessage(isUnchecked) {
  if (isUnchecked) {
    return "Please accept the privacy policy.";
  }
  return "";
}

init();
