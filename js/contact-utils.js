// JavasScript utility functions - Contacts page

// Variables:

const allContacts = [];
const CATEGORY = "contacts";
const TASKS = "tasks";

let myAccount = null;

// Functions:

/**
 * Gets own account or guest account data and creates object.
 * @async
 * @returns {Object} Own account or guest account object.
 */
async function getCurrentUserAccount() {
  const currentUserAccount = await window.getCurrentUser();

  const isGuestUser = currentUserAccount.isGuest === true;

  return {
    id: currentUserAccount.uid,
    name: currentUserAccount.name,
    email: currentUserAccount.email || "name@example.com",
    phone: "+49 123 4567890",
    isOwnAccount: !isGuestUser,
    isGuest: isGuestUser,
  };
}


/**
 * Gets own account or guest account data from local storage.
 * @param {Object} currentUser - Own account or guest account object.
 */
function getSavedUserData(currentUser) {
  if (currentUser.isGuest === true) {
    const savedGuestData = localStorage.getItem("guest");
    myAccount = savedGuestData ? JSON.parse(savedGuestData) : currentUser;
  } else {
    const savedAccountData = localStorage.getItem("account");
    myAccount = savedAccountData ? JSON.parse(savedAccountData) : currentUser;
  }
}


/**
 * Saves own account or guest account object with shortcut and shortcut color in local array.
 * @async
 */
async function saveOwnAccountData() {
  const currentUser = await getCurrentUserAccount();

  if (!currentUser) return;

  getSavedUserData(currentUser);

  getContactShortcut(myAccount);
  prepareContactColor(myAccount);
  allContacts.push(myAccount);
}


/**
 * Loads all contacts data from the database.
 * @async
 * @returns {Promise<Object>} Contact data.
 */
async function fetchAllContacts() {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const response = await fetch(`${window.firebaseUrl}/${CATEGORY}.json?auth=${idToken}`);

    const responseAsJSON = await response.json();
    return saveContacts(responseAsJSON);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


/**
 * Saves all contacts data with ID from database in local array.
 * @async
 * @param {Object} responseAsJSON - Object with all contact data.
 */
async function saveContacts(responseAsJSON) {
  allContacts.length = 0;
  const contactIDs = Object.keys(responseAsJSON);

  for (let index = 0; index < contactIDs.length; index++) {
    const databaseID = contactIDs[index];
    const contact = responseAsJSON[databaseID];
    contact.id = databaseID;
    allContacts.push(contact);
  }
  await saveOwnAccountData();
}


/**
 * Creates contact shortcut (first letter of first and last name) for every contact.
 * @param {Object} contact - Object with contact data.
 */
function getContactShortcut(contact) {
  const contactNameParts = contact.name.trim().split(/\s+/);

  const shortcut =
    contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  contact.shortcut = shortcut.toUpperCase();
}


/**
 * Adds the calculated shortcut color to the contact.
 * @param {Object} contact - Object with contact data.
 */
function prepareContactColor(contact) {
  const shortcutColor = calculateContactIconColor(contact.shortcut);
  contact.shortcutColor = shortcutColor;
}


/**
 * Corrects the shortcut when creating a new contact.
 * @param {string} contactShortcut - The first letter of firstname and lastname of a contact. 
 * @returns {string} The corrected contact shortcut.
 */
function getCorrectShortcut(contactShortcut) {
  return contactShortcut.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


/**
 * Calculates the shortcut color with the shortcut letters.
 * @param {string} contactShortcut - Contact shortcut.
 * @returns {string} The RGBA color code for CSS.
 */
function calculateContactIconColor(contactShortcut) {
  const correctShortcut = getCorrectShortcut(contactShortcut);

  const firstNameLetter = correctShortcut[0] || "X";
  const LastNameLetter = correctShortcut[1] || firstNameLetter;

  const value1 = firstNameLetter.charCodeAt(0) - 65;
  const value2 = LastNameLetter.charCodeAt(0) - 65;

  const r = (40 + value1 * 7).toFixed(0);
  const g = (40 + value2 * 7).toFixed(0);
  const b = (40 + (25 - value2) * 7).toFixed(0);

  return `rgba(${r} ${g} ${b} / 100%)`;
}


/**
 * Performs a general database query (fetch).
 * @async
 * @param {string} url - The URL of the database.
 * @param {string} method - The HTTP method.
 * @param {Object} data - Optional data for request body.  
 * @returns {Promise<Object>} The answer of the database as JSON.
 */
async function databaseRequest(url, method, data = null) {
  const options = {
    method: method,
    headers: { "Content-Type": "application/json" },
    ...(data && { body: JSON.stringify(data) }),
  };
  const response = await fetch(url, options);
  return response.json();
}


/**
 * Adds contact data to the database.
 * @async
 * @param {Object} newContactData - Object with contact data.
 * @returns {Promise<Object>} The created contact.
 */
async function addContactToDatabase(newContactData) {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${window.firebaseUrl}/${CATEGORY}.json?auth=${idToken}`;
    showToastMessage("Contact successfully created", "toast-message-new");
    return await databaseRequest(url, "POST", newContactData);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


/**
 * Creates the complete contact object for the database.
 * @returns {Object} The complete contact object.
 */
function getContactDataForDatabase() {
  return {
    name: currentContactData.name,
    email: currentContactData.email,
    phone: currentContactData.phone,
    shortcut: currentContactData.shortcut,
    shortcutColor: currentContactData.shortcutColor,
  };
}


/**
 * Updates the contact data in the database.
 * @async
 * @param {string} contactId - Contact ID number.
 * @returns {Promise<Object>} The updated contact data.
 */
async function editContactInDatabase(contactId) {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${window.firebaseUrl}/${CATEGORY}/${contactId}.json?auth=${idToken}`;
    showToastMessage("Contact successfully edited", "toast-message-edit");
    return await databaseRequest(url, "PUT", getContactDataForDatabase());
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


/**
 * Deletes the contact data in the database.
 * @async
 * @param {string} contactId - Contact ID number.
 * @returns {Promise<void>}
 */
async function deleteContactInDatabase(contactId) {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${window.firebaseUrl}/${CATEGORY}/${contactId}.json?auth=${idToken}`;
    showToastMessage("Contact successfully deleted", "toast-message-delete");
    await deleteContactsInTask(contactId);
    return await databaseRequest(url, "DELETE");
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


// Test - Kontakte in den Tasks auf der Board-Seite entfernen

/**
 * Updates the contacts in the task and in the database.
 * @async
 * @param {string} currentTaskID - Task ID number. 
 * @param {string[]} contacts - All contact ID numbers of the task. 
 * @param {string} contactId - Contact ID number. 
 * @returns {Promise<Object>} The updated contacts from the task. 
 */
async function updateContactsInTask(currentTaskID, contacts, contactId) {
  try {
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const contactsIndex = contacts.indexOf(contactId);
    if (contactsIndex === -1) return;

    contacts.splice(contactsIndex, 1);
    const taskURL = window.firebaseUrl + TASKS + "/" + currentTaskID + ".json" + "?auth=" + idToken;
    await fetch(taskURL, { method: "PATCH", body: JSON.stringify({ assignedTo: contacts }) });
  } catch (error) {
    openDialogConnectionErrorDatabase();    
  }
}


/**
 * Saves all task and contact ID numbers from the tasks.
 * @async
 * @param {Object} responseAsJSON - Object with all task data.
 * @param {string} contactId - Contact ID number. 
 */
async function checkContactsInTask(responseAsJSON, contactId) {
  const taskIDs = Object.keys(responseAsJSON);
  
  for (let index = 0; index < taskIDs.length; index++) {
    const currentTaskID = taskIDs[index];
    const contacts = responseAsJSON[currentTaskID].assignedTo || [];
    await updateContactsInTask(currentTaskID, contacts, contactId);
  }  
}


/**
 * Deletes the contact in the task and in the database. Gets and saves all task data.
 * @async
 * @param {string} contactId - Contact ID number.
 * @returns {Promise<Object>} Task data. 
 */
async function deleteContactsInTask(contactId) {
  try {
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${window.firebaseUrl}${TASKS}.json?auth=${idToken}`;
    const response = await fetch(url);
    const responseAsJSON = await response.json() || {};

    await checkContactsInTask(responseAsJSON, contactId);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}