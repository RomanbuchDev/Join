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
    const user = await registerWithEmail(
      signupUserData.name,
      signupUserData.email,
      signupUserData.password,
    );
    handleSignupSuccess(user);
  } catch (error) {
    handleSignupError();
    document.getElementById("signup").disabled = false;
  }
}

/**
 * Speichert den registrierten User und leitet nach erfolgreicher Registrierung weiter.
 * @param {Object} user - Der registrierte User.
 */
function handleSignupSuccess(user) {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: user.name, isGuest: user.isGuest }),
  );
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
  // const userCheckRegister = findRegisterMailMatch(signupUserData);// muss noch übertragen werden
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

function checkConfirmPasswordField(password, confirmPassword) {
  const isEmpty = confirmPassword.trim() === "";
  const isMismatch = !isEmpty && confirmPassword !== password;
  markFieldError("registerConfirmPassword", isEmpty || isMismatch);
  return { isEmpty, isMismatch };
}

/**
 * Baut den passenden Fehlertext aus den Prüfungsergebnissen zusammen.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - Ergebnis der Email-Prüfung.
 * @param {boolean} passwordEmpty - Ob das Passwort-Feld leer ist.
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

function updateSignupButtonState() {
  const checkboxChecked = document.getElementById("privacyCheck").checked;
  document.getElementById("signup").disabled = !checkboxChecked;
}

function checkPrivacyField(isChecked) {
  const isUnchecked = !isChecked;
  markFieldError("privacyCheckField", isUnchecked);
  return isUnchecked;
}

function getPrivacyErrorMessage(isUnchecked) {
  if (isUnchecked) {
    return "Please accept the privacy policy.";
  }
  return "";
}

init();
