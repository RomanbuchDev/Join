// JavasScript utility functions - Contacts page

// Variables:

const allContacts = [];

// Functions:

async function fetchAllContacts() {
  try {
    const response = await fetch("../js/contact-list.json");
    const responseAsJSON = await response.json();
    return saveContacts(responseAsJSON);
  } catch (error) {
    console.error("Error loading data!", error);
  }
}


function saveContacts(responseAsJSON) {
  allContacts.length = 0;
  for (let index = 0; index < responseAsJSON.length; index++) {
    const contact = responseAsJSON[index];
    getContactShortcut(contact);
    prepareContactColor(contact);
    allContacts.push(contact);
  }
  return allContacts;
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
