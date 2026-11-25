// #region AUTH

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
    `${window.firebaseUrl}/users/${user.uid}.json?auth=${idToken}`,
  );
  if (!response.ok) {
    throw new Error("Failed to load user profile");
  }
  const profile = await response.json();
  return { uid: user.uid, name: profile.name, email: user.email };
}


/**
 * Signs the logged-in user out via Firebase Auth and then redirects to the login page.
 */
async function handleLogoutClick() {
  try {
    document.body.classList.add("is-loading");
    await window.signOut(window.auth);
    window.location.href = "../index.html";
  } catch (error) {
    openDialogConnectionErrorDatabase();
  } finally {
    document.body.classList.remove("is-loading");
  }
}

// #endregion

// #region HEADER


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
 * Opens or closes the menu dropdown and updates aria-expanded on the button.
 * @param {HTMLButtonElement} button - The button that was clicked.
 * @param {string} id - The id of the toggled menu.
 */
function toggleMenu(button, menuId) {
  const menu = document.getElementById(menuId);
  menu.classList.toggle("is-open");
  const isOpen = menu.classList.contains("is-open");
  button.setAttribute("aria-expanded", isOpen);
}


/**
 * Resets the header for an unauthenticated visitor: clears the avatar and hides the user menu.
 */
function showGuestUI() {
  avatarExport("");
  document.querySelector(".user-menu").hidden = true;
}


/**
 * Renders the header for an authenticated user: fetches their profile and shows the user menu.
 * @param {Object} user - The raw Firebase user object (uid, email, isAnonymous, getIdToken()).
 */
async function showAuthenticatedUI(user) {
  try {
    const profile = await fetchUserProfile(user);
    initAvatar(profile);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  } finally {
    document.querySelector(".user-menu").hidden = false;
  }
}


/**
 * Registers an auth-state listener that renders the header, independent of
 * the navbar.
 */
function initHeaderAuthUI() {
  window.onAuthStateChanged(window.auth, async (user) => {
    if (user) {
      await showAuthenticatedUI(user);
    } else {
      showGuestUI();
    }
  });
}

/**
 * Bootstraps the header auth-state listener on every page that has a
 * #header element.
 */
if (document.getElementById("header")) {
  initHeaderAuthUI();
}


// #endregion

// #region NAV

/**
 * Gets the filename of the currently open page, e.g. "imprint.html".
 * Falls back to "index.html" when the path ends in a slash (no filename).
 * @returns {string} The current page's filename.
 */
function getCurrentPage() {
  return location.pathname.split("/").pop() || "index.html";
}


/**
 * Renders the navbar for an authenticated user (account or guest).
 * @param {string} currentPage - The current page's filename, for aria-current highlighting.
 */
function renderNavbarAuthenticated(currentPage) {
  document.getElementById("navbar-content").innerHTML =
    templateNavAuthenticated(currentPage);
}


/**
 * Renders the navbar for a visitor who is not authenticated.
 * @param {string} currentPage - The current page's filename, for aria-current highlighting.
 */
function renderNavbarGuest(currentPage) {
  document.getElementById("navbar-content").innerHTML =
    templateNavUnauthenticated(currentPage);
}


/**
 * Registers an auth-state listener and renders the navbar
 * depending on whether the visitor is authenticated.
 */
function initNavbarAuthUI() {
  window.onAuthStateChanged(window.auth, async (user) => {
    const currentPage = getCurrentPage();
    if (user) {
      renderNavbarAuthenticated(currentPage);
    } else {
      renderNavbarGuest(currentPage);
    }
  });
}

/**
 * Bootstraps the navbar auth-state listener, but only on pages that have
 * adopted the dynamic navbar (i.e. provide a #navbar-content container).
 * Pages with a static navbar skip this safely.
 */
if (document.getElementById("navbar-content")) {
  initNavbarAuthUI();
}

// #endregion

// #region TOAST MESSAGE

const toastMessage = document.getElementById("toast-message");

let toastMessageTime;

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

// #endregion

// #region CONNECTION ERROR DIALOG

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

// #endregion

// #region UTILS

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
 * Builds a greeting matching the current time of day.
 * @returns {string} "Good morning", "Good afternoon" or "Good evening".
 */
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

// #endregion
