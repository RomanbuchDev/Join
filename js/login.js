/**
 * Startet das Setup, sobald die Seite geladen ist.
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
 * Registriert alle Event-Listener für die Login-Seite.
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
 * Reagiert auf das Absenden des Login-Formulars.
 * @param {HTMLFormElement} form - Das Login-Formular-Element.
 */
function loginEventListener(form) {
  form.addEventListener("submit", handleLoginSubmit);
}


/**
 * Wechselt das Schloss-Icon, je nachdem ob das Passwort-Feld leer ist oder nicht.
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
 * Reagiert auf Klicks auf das Sichtbarkeits-Icon.
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
 * Schaltet zwischen sichtbarem und verstecktem Passwort um (inkl. Icon-Austausch).
 * @param {HTMLImageElement} icon - Das Sichtbarkeits-Icon.
 * @param {HTMLInputElement} inputPasswordCheck - Das Passwort-Eingabefeld.
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
 * Verarbeitet das Absenden des Formulars: liest die Werte, validiert sie, startet bei Erfolg den Login.
 * @param {SubmitEvent} event - Das Submit-Event des Formulars.
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
 * Versucht den Login mit den eingegebenen Daten durchzuführen.
 * @param {Object} loginUserData - Die eingegebenen Formulardaten (Email, Passwort).
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
 * Reagiert auf Klicks auf den Gast-Login-Button.
 * @param {HTMLButtonElement} formGuest - Der Gast-Login-Button.
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
 * Leitet nach erfolgreichem Login weiter — die Sitzung selbst verwaltet Firebase Auth.
 */
function handleLoginSuccess() {
  setTimeout(() => {
    window.location.href = "./html/greeting-page.html";
  }, 1500);
}

/**
 * Zeigt eine Fehlermeldung nach fehlgeschlagenem Login an.
 */
function handleLoginError() {
  document.getElementById("loginError").innerText =
    "Password or email is incorrect!";
  markFieldError("exampleInputEmail1", true);
  markFieldError("exampleInputPassword1", true);
}

/**
 * Prüft, ob die eingegebenen Login-Daten gültig sind, und zeigt ggf. eine Fehlermeldung.
 * @param {Object} loginUserData - Die eingegebenen Formulardaten.
 * @returns {boolean} Ob die Eingaben gültig sind.
 */
function isLoginInputValid(loginUserData) {
  const emailCheck = checkEmailField(loginUserData.email);
  const passwordEmpty = checkPasswordField(loginUserData.password);
  const message = getLoginErrorMessage(emailCheck, passwordEmpty);
  document.getElementById("loginError").innerText = message;
  return message === "";
}

/**
 * Prüft, ob das Email-Feld leer oder ungültig ist.
 * @param {string} email - Die eingegebene Email-Adresse.
 * @returns {{isEmpty: boolean, isInvalid: boolean}} Ergebnis der Prüfung.
 */
function checkEmailField(email) {
  const isEmpty = email.trim() === "";
  const isInvalid = !isEmpty && (!email.includes("@") || !email.includes("."));
  markFieldError("exampleInputEmail1", isEmpty || isInvalid);
  return { isEmpty, isInvalid };
}

/**
 * Prüft, ob das Passwort-Feld leer ist.
 * @param {string} password - Das eingegebene Passwort.
 * @returns {boolean} Ob das Feld leer ist.
 */
function checkPasswordField(password) {
  const isEmpty = password.trim() === "";
  markFieldError("exampleInputPassword1", isEmpty);
  return isEmpty;
}

/**
 * Baut den passenden Fehlertext aus den Email-/Passwort-Prüfungen zusammen.
 * @param {{isEmpty: boolean, isInvalid: boolean}} emailCheck - Ergebnis der Email-Prüfung.
 * @param {boolean} passwordEmpty - Ob das Passwort-Feld leer ist.
 * @returns {string} Die anzuzeigende Fehlermeldung.
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
 * Liest Email und Passwort aus dem Formular aus.
 * @returns {Object} Die eingegebenen Formulardaten.
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
 * Setzt Button- und Fehlerzustand zurück, wenn die Seite (erneut) angezeigt wird.
 */
function resetLoginFormState() {
  document.getElementById("loginBtn").disabled = false;
  document.getElementById("guestLoginBtn").disabled = false;
  markFieldError("exampleInputEmail1", false);
  markFieldError("exampleInputPassword1", false);
  document.getElementById("loginError").innerText = "";
}


init();
