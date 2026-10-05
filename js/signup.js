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
  setupPasswordVisibilityListeners();
  setupButtonStateListeners();
}


/**
 * Registriert die Sichtbarkeits-Icon-Listener für beide Passwortfelder.
 */
function setupPasswordVisibilityListeners() {
  visibilityEventListener("registerPassword", "visibility-icon-password");
  inputPasswordCheck("registerPassword", "visibility-icon-password");
  visibilityEventListener("registerConfirmPassword", "visibility-icon-confirm");
  inputPasswordCheck("registerConfirmPassword", "visibility-icon-confirm");
}


/**
 * Registriert Listener auf allen Pflichtfeldern/der Checkbox, die den Button-Status neu berechnen.
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
 * Hängt einen Listener an ein Element, der den Sign-up-Button-Status neu berechnet.
 * @param {string} elementId
 * @param {string} eventType
 */
function addButtonStateListener(elementId, eventType) {
  document
    .getElementById(elementId)
    .addEventListener(eventType, updateSignupButtonState);
}


/**
 * Reagiert auf das Absenden des Signup-Formulars.
 * @param {HTMLFormElement} form
 */
function signupEventListener(form) {
  form.addEventListener("submit", handleSignupSubmit);
}


/**
 * Wechselt das Schloss-Icon je nach Inhalt des Passwort-Felds.
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
 * Reagiert auf Klicks auf das Sichtbarkeits-Icon.
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
    handleSignupError(error);
    document.getElementById("signup").disabled = false;
  }
}


/**
 * Leitet nach erfolgreicher Registrierung zur Login-Seite weiter (kein Auto-Login).
 */
function handleSignupSuccess() {
  document.getElementById("signupToast").classList.add("show");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 3000);
}


/**
 * Baut die Fehlermeldung anhand des Firebase-Fehlercodes und markiert das betroffene Feld.
 * @param {Object} error - Der von Firebase Auth geworfene Fehler.
 * @returns {string} Die anzuzeigende Fehlermeldung.
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
 * Zeigt eine Fehlermeldung nach fehlgeschlagener Registrierung an.
 */
function handleSignupError(error) {
  document.getElementById("signupError").innerText =
    getSignupServerErrorMessage(error);
}


/**
 * Prüft, ob alle Formulardaten gültig sind, und zeigt ggf. eine Fehlermeldung.
 * @param {Object} signupUserData - Die eingegebenen Formulardaten.
 * @returns {boolean} Ob die Eingaben gültig sind.
 */
function isSignupInputValid(signupUserData) {
  const checks = getSignupFieldChecks(signupUserData);
  const message = getSignupErrorMessage(checks);
  document.getElementById("signupError").innerText = message;
  return message === "";
}


/**
 * Liest Name, Email, Passwort, Bestätigung und Datenschutz-Checkbox aus dem Formular aus.
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
 * Liest den Wert eines Eingabefelds aus.
 * @param {string} inputId
 * @returns {string}
 */
function getFieldValue(inputId) {
  return document.getElementById(inputId).value;
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
 * Aktiviert/deaktiviert den Sign-up-Button anhand des Datenschutz-Checkbox-Status.
 */
function updateSignupButtonState() {
  const checkboxChecked = document.getElementById("privacyCheck").checked;
  document.getElementById("signup").disabled = !checkboxChecked;
}


init();
