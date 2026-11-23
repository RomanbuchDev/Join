/**
 * Loads and renders available assignees and restores selected assignments.
 * @param {string[]} [assignedIds=[]] - IDs of previously assigned contacts or users.
 * @param {Object.<string, Object>} [assignedUserBadges={}] - Saved user badges keyed by user ID.
 * @returns {Promise<void>} Resolves when the assignee selection is initialized.
 */
async function initTaskForm(assignedIds = [], assignedUserBadges = {}) {
  const contacts = await loadAssignedContacts();
  await addSelfAssignee(contacts);
  addSavedUserAssignees(contacts, assignedIds, assignedUserBadges);
  renderAssignedContacts(contacts);
  setAssignedContacts(assignedIds);
}


/**
 * Adds saved user assignees that are missing from the contacts array.
 * @param {Object[]} contacts - The contacts array to extend.
 * @param {string[]} [assignedIds=[]] - IDs of previously assigned contacts or users.
 * @param {Object.<string, Object>} [badges={}] - Saved user badges keyed by user ID.
 * @returns {void}
 */
function addSavedUserAssignees(contacts, assignedIds = [], badges = {}) {
  for (const id of assignedIds) {
    addSavedUserAssignee(contacts, id, badges);
  }
}


/**
 * Adds a missing user assignee if saved badge data is available.
 * @param {Object[]} contacts - The contacts array to extend.
 * @param {string} id - The ID of the assignee to restore.
 * @param {Object.<string, Object>} badges - Saved user badges keyed by user ID.
 * @returns {void}
 */
function addSavedUserAssignee(contacts, id, badges) {
  if (contacts.some((contact) => contact.id === id)) return;

  const badge = badges[id];
  if (!badge) return;

  contacts.push(createSavedUserAssignee(id, badge));
}


/**
 * Creates a user assignee from saved badge data with a fallback name.
 * @param {string} id - The user's ID.
 * @param {Object} badge - The saved badge data.
 * @param {string} [badge.name] - The user's display name.
 * @param {string} [badge.shortcut] - The user's initials.
 * @returns {Object} The restored assignee with its ID, source, and display name.
 */
function createSavedUserAssignee(id, badge) {
  return {
    ...badge,
    id,
    source: "users",
    name: badge.name ?? badge.shortcut ?? "User",
  };
}


/**
 * Selects the checkboxes matching the assigned IDs and updates the badges.
 * @param {string[]|null} [assignedIds=[]] - IDs of the contacts or users to select.
 * @returns {void}
 */
function setAssignedContacts(assignedIds = []) {
  const checkboxes = document.querySelectorAll(
    '#contact_list input[type="checkbox"]',
  );
  for (const checkbox of checkboxes) {
    checkbox.checked = (assignedIds ?? []).includes(checkbox.value);
  }
  renderSelectedContactBadges();
}


/**
 * Renders the assignee list with the current user first,
 * followed by the remaining contacts sorted by name.
 * @param {Object[]} contacts - The contacts and user assignees to display.
 * @returns {void}
 */
function renderAssignedContacts(contacts) {
  const contactList = document.getElementById("contact_list");
  const sortedContacts = [...contacts].sort(compareAssignedContacts);
  contactList.replaceChildren();

  for (const contact of sortedContacts) {
    contactList.append(createAssignedContactRow(contact));
  }
}


/**
 * Sorts the current user first and compares other assignees
 * by name using German sorting rules, ignoring case and accents.
 * @param {Object} first - The first assignee to compare.
 * @param {Object} second - The second assignee to compare.
 * @returns {number} A negative value if first comes before second,
 * a positive value if it comes after, or zero if they compare equally.
 */
function compareAssignedContacts(first, second) {
  const firstIsSelf = isCurrentUserContact(first);
  const secondIsSelf = isCurrentUserContact(second);

  if (firstIsSelf !== secondIsSelf) {
    return firstIsSelf ? -1 : 1;
  }

  return first.name.localeCompare(second.name, "de", {
    sensitivity: "base",
  });
}


/**
 * Checks whether an assignee represents the currently signed-in user.
 * @param {Object} contact - The assignee to check.
 * @returns {boolean} True if the assignee matches the current user.
 */
function isCurrentUserContact(contact) {
  const uid = window.auth.currentUser?.uid;
  return contact.source === "users" && contact.id === uid;
}


/**
 * Filters assignees by name prefix when at least two characters
 * are entered and opens the dropdown.
 * @param {string} value - The search text entered by the user.
 * @returns {void}
 */
function filterAssignedContacts(value) {
  const search = value.trim().toLocaleLowerCase("de");
  const list = document.getElementById("contact_list");

  for (const row of list.children) {
    const name = row.querySelector(".assigned-contact-name").textContent;
    row.hidden =
      search.length >= 2 && !name.toLocaleLowerCase("de").startsWith(search);
  }

  list.hidden = false;
  document.getElementById("assigned-to").setAttribute("aria-expanded", "true");
}


/**
 * Creates an assignee list item with a name, badge, and checkbox.
 * Adds "(You)" to the current user's name.
 * @param {Object} contact - The contact or user assignee to display.
 * @returns {HTMLLIElement} The populated assignee list item.
 */
function createAssignedContactRow(contact) {
  const row = document.createElement("li");
  row.innerHTML = getAssignedContactTemplate();
  const isSelf =
    contact.source === "users" && contact.id === window.auth.currentUser?.uid;
  row.querySelector(".assigned-contact-name").textContent =
    contact.name + (isSelf ? " (You)" : "");
  setContactBadge(row, contact);
  setContactCheckbox(row, contact);
  return row;
}


/**
 * Sets an assignee badge's initials and background color.
 * @param {HTMLLIElement} row - The list item containing the badge.
 * @param {Object} contact - The assignee's badge data.
 * @param {string} contact.shortcut - The initials displayed in the badge.
 * @param {string} contact.shortcutColor - The badge's background color.
 * @returns {void}
 */
function setContactBadge(row, contact) {
  const badge = row.querySelector(".selected-contact-badge");
  badge.textContent = contact.shortcut;
  badge.style.backgroundColor = contact.shortcutColor;
}


/**
 * Sets the checkbox value and stores assignee data in its data attributes.
 * @param {HTMLLIElement} row - The list item containing the checkbox.
 * @param {Object} contact - The assignee data.
 * @param {string} contact.id - The assignee's ID.
 * @param {string} [contact.source="contacts"] - The assignee's data source.
 * @param {string} contact.name - The assignee's display name.
 * @param {string} contact.shortcut - The assignee's initials.
 * @param {string} contact.shortcutColor - The badge's background color.
 * @returns {void}
 */
function setContactCheckbox(row, contact) {
  const checkbox = row.querySelector("input");
  checkbox.value = contact.id;
  checkbox.dataset.source = contact.source ?? "contacts";
  checkbox.dataset.name = contact.name;
  checkbox.dataset.shortcut = contact.shortcut;
  checkbox.dataset.shortcutColor = contact.shortcutColor;
}


/**
 * Toggles the assignee dropdown and updates its expanded state.
 * @returns {void}
 */
function toggleAssignedContacts() {
  const contactList = document.getElementById("contact_list");
  const assignedToInput = document.getElementById("assigned-to");

  contactList.hidden = !contactList.hidden;
  assignedToInput.setAttribute("aria-expanded", String(!contactList.hidden));
}


/**
 * Loads contacts from Firebase using the current user's ID token.
 * @returns {Promise<Object[]>} Resolves with contact objects including their IDs.
 * @throws {Error} If the request fails or the response cannot be processed.
 */
async function loadAssignedContacts() {
  const idToken = await window.auth.currentUser.getIdToken();
  const response = await fetch(
    `${window.firebaseUrl}/contacts.json?auth=${encodeURIComponent(idToken)}`,
  );
  checkContactsResponse(response);
  const data = await response.json();
  return Object.entries(data ?? {}).map(([id, contact]) => ({
    ...contact,
    id,
  }));
}


/**
 * Checks whether the contacts request was successful.
 * @param {Response} response - The HTTP response to check.
 * @returns {void}
 * @throws {Error} If the response indicates an unsuccessful HTTP status.
 */
function checkContactsResponse(response) {
  if (response.ok) return;

  throw new Error(
    `Kontakte konnten nicht geladen werden (${response.status}).`,
  );
}


/**
 * Renders badges for all selected assignees using their initials and colors.
 * @returns {void}
 */
function renderSelectedContactBadges() {
  const badges = document.getElementById("selected-contact-badges");
  const checkedContacts = document.querySelectorAll(
    `#contact_list input[type="checkbox"]:checked`,
  );

  badges.replaceChildren();

  for (const checkbox of checkedContacts) {
    const badge = document.createElement("span");
    badge.className = "selected-contact-badge";
    badge.textContent = checkbox.dataset.shortcut;
    badge.style.backgroundColor = checkbox.dataset.shortcutColor;

    badges.append(badge);
  }
}


/**
 * Adds the current user to the contacts array if signed in with a non-anonymous account
 * and a profile name is available.
 * @param {Object[]} contacts - The contacts array to extend.
 * @returns {Promise<void>} Resolves when the attempt to add the current user is complete.
 */
async function addSelfAssignee(contacts) {
  const user = window.auth.currentUser;
  if (!isAssignableUser(user)) return;

  await tryAddSelfAssignee(contacts, user);
}


/**
 * Checks whether the user has a non-anonymous account.
 * @param {Object|null} user - The current authentication user, or null if signed out.
 * @returns {boolean|null} True for a non-anonymous user, false for an anonymous user,
 * or null if signed out.
 */
function isAssignableUser(user) {
  return user && !user.isAnonymous;
}


/**
 * Attempts to add the current user to the contacts array using their profile.
 * Logs a warning if loading or processing the profile fails.
 * @param {Object[]} contacts - The contacts array to extend.
 * @param {Object} user - The authenticated user whose profile is loaded.
 * @returns {Promise<void>} Resolves when the attempt is complete.
 */
async function tryAddSelfAssignee(contacts, user) {
  try {
    const profile = await loadUserProfile(user);
    addSelfAssigneeFromProfile(contacts, user, profile);
  } catch (error) {
    console.warn("Eigenes Profil konnte nicht geladen werden", error);
  }
}


/**
 * Prepends the current user to the contacts array if their profile has a non-blank name.
 * @param {Object[]} contacts - The contacts array to extend.
 * @param {Object} user - The authenticated user.
 * @param {string} user.uid - The user's ID.
 * @param {Object|null} profile - The user's profile data.
 * @param {string} [profile.name] - The user's display name.
 * @returns {void}
 */
function addSelfAssigneeFromProfile(contacts, user, profile) {
  const name = profile?.name?.trim();
  if (!name) return;

  contacts.unshift(createSelfAssignee(user.uid, name));
}


/**
 * Loads the user's profile from Firebase using their ID token.
 * @param {Object} user - The authenticated user whose profile is loaded.
 * @returns {Promise<Object|null>} Resolves with the profile data, or null if no profile exists.
 * @throws {Error} If authentication, the request, or response processing fails.
 */
async function loadUserProfile(user) {
  const idToken = await user.getIdToken();
  const path = `users/${encodeURIComponent(user.uid)}`;
  const response = await fetch(
    `${window.firebaseUrl}/${path}.json?auth=${encodeURIComponent(idToken)}`,
  );
  if (!response.ok) {
    throw new Error(`Profil konnte nicht geladen werden (${response.status}).`);
  }
  return response.json();
}


/**
 * Creates an assignee for the current user with initials and a blue badge.
 * @param {string} uid - The user's ID.
 * @param {string} name - The user's non-empty, trimmed display name.
 * @returns {Object} The user assignee with its ID, name, initials, badge color, and source.
 */
function createSelfAssignee(uid, name) {
  const initials = name.split(/\s+/).slice(0, 2);
  return {
    id: uid,
    name,
    shortcut: initials
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
    shortcutColor: "#29abe2",
    source: "users",
  };
}


/**
 * Closes the assignee dropdown when a click occurs outside its form field.
 * @param {MouseEvent} event - The click event used to check the clicked element.
 * @returns {void}
 */
function closeAssignedContactsOnOutsideClick(event) {
  const contactList = document.getElementById("contact_list");
  if (!contactList || contactList.hidden) return;
  if (event.target.closest(".form-field--assigned")) return;

  toggleAssignedContacts();
}
