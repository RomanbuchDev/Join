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