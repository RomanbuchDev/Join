// JavasScript utility functions - Contacts page

// Variables:

const allContacts = [];

const BASE_URL =
  "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app";
const CATEGORY = "contacts";

// Functions:

async function fetchAllContacts() {
  try {
    // const response = await fetch("../js/contact-list.json");
    const response = await fetch(`${BASE_URL}/${CATEGORY}.json`);
    const responseAsJSON = await response.json();
    return saveContacts(responseAsJSON);
  } catch (error) {
    console.error("Error loading data!", error);
  }
}


function saveContacts(responseAsJSON) {
  allContacts.length = 0;
  const contactIDs = Object.keys(responseAsJSON);

  for (let index = 0; index < contactIDs.length; index++) {
    const databaseID = contactIDs[index];
    const contact = responseAsJSON[databaseID];
    contact.id = databaseID;
    allContacts.push(contact);
  }
}


function getContactShortcut(contact) {
  const contactNameParts = contact.name.trim().split(/\s+/);

  const shortcut =
    contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  contact.shortcut = shortcut.toUpperCase();
}


function prepareContactColor(contact) {
  const shortcutColor = calculateContactIconColor(contact.shortcut);
  contact.shortcutColor = shortcutColor;
}


function calculateContactIconColor(contactShortcut) {
  const correctShortcut = contactShortcut.toUpperCase();

  const firstNameLetter = correctShortcut[0] || "X";
  const LastNameLetter = correctShortcut[1] || firstNameLetter;

  const value1 = firstNameLetter.charCodeAt(0) - 65;
  const value2 = LastNameLetter.charCodeAt(0) - 65;

  const r = (40 + value1 * 7).toFixed(0);
  const g = (40 + value2 * 7).toFixed(0);
  const b = (40 + (25 - value2) * 7).toFixed(0);

  return `rgba(${r} ${g} ${b} / 100%)`;
}


async function addContactToDatabase(newContactData) {
  try {
    const response = await fetch(`${BASE_URL}/${CATEGORY}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newContactData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving data:", error);
  }
}


function getContactDataForDatabase() {
  return {
    name: currentContactData.name,
    email: currentContactData.email,
    phone: currentContactData.phone,
    shortcut: currentContactData.shortcut,
    shortcutColor: currentContactData.shortcutColor,
  };
}


async function editContactInDatabase(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/${CATEGORY}/${contactId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getContactDataForDatabase()),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving data:", error);
  }
}


async function deleteContactInDatabase(contactId) {
  try {
    const response = await fetch(`${BASE_URL}/${CATEGORY}/${contactId}.json`, {
      method: "DELETE",
    });
    const responseAsJSON = await response.json();
    return responseAsJSON;
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}
