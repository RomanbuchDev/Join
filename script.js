const toastMessage = document.getElementById("toast-message");

let toastMessageTime;

/**
 * Renders the header with the avatar initials of the given user.
 * @param {Object} user - The logged-in user ({ uid, name, email, isGuest }).
 */
function initAvatar(user) {
  const avatarShortcut = getAvatarShortcut(user);
  avatarExport(avatarShortcut);
}


/**
 * Builds the avatar initials from the user's name (first letter of the first two name parts).
 * A guest ("Guest") results in "G".
 * @param {Object} user - The logged-in user.
 * @returns {string} The initials in uppercase, e.g. "AE".
 */
function getAvatarShortcut(user) {
  const avatarNameParts = user.name.trim().split(/\s+/);
  const shortcut =
    avatarNameParts.length > 1
      ? avatarNameParts[0][0] + avatarNameParts[1][0]
      : avatarNameParts[0][0];
  return shortcut.toUpperCase();
}


/**
 * Inserts the header template with the given initials into the #header element.
 * @param {string} avatarShortcut - The initials shown in the avatar button.
 */
function avatarExport(avatarShortcut) {
  const template = templateHeader(avatarShortcut);
  document.getElementById("header").innerHTML = template;
}


/**
 * Opens or closes the user menu dropdown and updates aria-expanded on the avatar button.
 * @param {HTMLButtonElement} button - The avatar button that was clicked.
 */
function toggleUserMenu(button) {
  const userMenu = document.querySelector("#user-menu-dropdown");
  userMenu.classList.toggle("is-open");
  const isOpen = userMenu.classList.contains("is-open");
  button.setAttribute("aria-expanded", isOpen);
}


/**
 * Waits for the logged-in user and renders the header for the current page.
 * @returns {Promise<Object>} The logged-in user.
 */
async function initHeader() {
  const user = await window.getCurrentUser();
  initAvatar(user);
  return user;
}


/**
 * Builds the {uid, name, email} profile for a logged-in Firebase user, fetching the
 * name from the Realtime Database. Anonymous (guest) users get the name "Guest"
 * without a DB fetch.
 * @param {Object} user - The raw Firebase user object (uid, email, isAnonymous, getIdToken()).
 * @returns {Promise<Object>} The profile {uid, name, email, isGuest?}.
 */
async function fetchUserProfile(user) {
  if (user.isAnonymous) {
    return { uid: user.uid, name: "Guest", isGuest: true };
  }
  const idToken = await user.getIdToken();
  const response = await fetch(
    `${window.firebaseUrl}users/${user.uid}.json?auth=${idToken}`,
  );
  const profile = await response.json();
  return { uid: user.uid, name: profile.name, email: user.email };
}


/**
 * Toggles the legal-page navbar and avatar based on auth state.
 */
function initLegalPageAuthUI() {
  window.onAuthStateChanged(window.auth, async (user) => {
    const navList = document.querySelector(".main-nav-list");
    const guestList = document.querySelector(".main-nav-guest-list");
    const guestRowLegal = document.querySelector(".main-nav-legal");
    if (user) {
      const profile = await fetchUserProfile(user);
      initAvatar(profile);
      document.querySelector(".user-menu").hidden = false;
      navList.hidden = false;
      guestList.hidden = true;
      guestRowLegal.hidden = true;
    } else {
      avatarExport("");
      document.querySelector(".user-menu").hidden = true;
      navList.hidden = true;
      guestList.hidden = false;
      guestRowLegal.hidden = false;
    }
  });
}



/**
 * Escapes characters with a special meaning in HTML, so that text is displayed as plain text
 * and not interpreted as markup. Safe for HTML content and for quoted attribute values.
 * @param {*} text - The value to escape; it is converted to a string first.
 * @returns {string} The escaped text.
 */
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


/**
 * Hides the toast message and removes the CSS status class.
 * @param {string} statusClass - The CSS class for the background color.
 */
function hideToastMessage(statusClass) {
  toastMessage.classList.remove("show");
  toastMessage.addEventListener(
    "transitionend",
    function toastMessageTransitionEnd() {
      toastMessage.classList.remove(statusClass);
      toastMessage.hidePopover();
      toastMessage.removeEventListener(
        "transitionend",
        toastMessageTransitionEnd,
      );
    },
  );
}


/**
 * Shows a toast message for a short time.
 * @param {string} text - The toast message text.
 * @param {string} statusClass - The CSS class for the background color.
 */
function showToastMessage(text, statusClass) {
  if (toastMessageTime) clearTimeout(toastMessageTime);
  toastMessage.className = "toast-message";
  toastMessage.textContent = text;

  toastMessage.showPopover();
  toastMessage.classList.add("show", statusClass);

  toastMessageTime = setTimeout(() => {
    hideToastMessage(statusClass);
  }, 3000);
}


/** Closes the dialog window showing the database connection error. */
function closeDialogConnectionErrorDatabase() {
  const dialogBoxConnectionErrorDatabase = document.getElementById(
    "connection-error-database-dialog",
  );

  if (dialogBoxConnectionErrorDatabase) {
    dialogBoxConnectionErrorDatabase.remove();
  }
}


/** Reloads the page. */
function reloadPage() {
  window.location.reload();
}


/** Opens the dialog window showing the database connection error. */
function openDialogConnectionErrorDatabase() {
  const openErrorMessage = document.getElementById(
    "connection-error-database-dialog",
  );
  if (openErrorMessage) return;

  const errorMessage = getConnectionErrorDatabaseTemplate();
  document.body.insertAdjacentHTML("beforeend", errorMessage);

  const dialogBoxConnectionErrorDatabase = document.getElementById(
    "connection-error-database-dialog",
  );

  if (dialogBoxConnectionErrorDatabase) {
    dialogBoxConnectionErrorDatabase.showModal();
  }
}


function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

/**
 * Signs the logged-in user out via Firebase Auth and then redirects to the login page.
 */
async function handleLogoutClick() {
  await window.signOut(window.auth);
  window.location.href = "../index.html";
}

const logoutButton = document.querySelector(".user-menu-logout");
if (logoutButton) {
  logoutButton.addEventListener("click", handleLogoutClick);
}