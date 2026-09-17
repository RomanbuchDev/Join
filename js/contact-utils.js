// JavasScript utility functions - Contacts page

// Variables:

const allContacts = [];
let myAccount = null;

const BASE_URL =
  "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app";
const CATEGORY = "contacts";

// Functions:

async function getCurrentUserAccount() {
  const currentUserAccount = await window.getCurrentUser();
  console.log(currentUserAccount);

  const isGuestUser = currentUserAccount.isGuest === true;

  return {
    id: currentUserAccount.uid,
    name: currentUserAccount.name,
    email: currentUserAccount.email || "name@example.com",
    phone: "+49 123 4567890",
    isOwnAccount: !isGuestUser,
    isGuest: isGuestUser,
  };

  // Aktueller Stand:
  // return {
  //   id: "123",
  //   name: "Eingeloggter Test-Benutzer",
  //   email: "test@test.de",
  //   isOwnAccount: true
  // };
}


function getSavedUserData(currentUser) {
  if (currentUser.isGuest === true) {
    const savedGuestData = localStorage.getItem("guest");
    myAccount = savedGuestData ? JSON.parse(savedGuestData) : currentUser;
  } else {
    const savedAccountData = localStorage.getItem("account");
    myAccount = savedAccountData ? JSON.parse(savedAccountData) : currentUser;
  }
}


async function saveOwnAccountData() {
  const currentUser = await getCurrentUserAccount();

  if (!currentUser) return;

  getSavedUserData(currentUser);

  console.log(myAccount);
  getContactShortcut(myAccount);
  prepareContactColor(myAccount);
  allContacts.push(myAccount);
}


async function fetchAllContacts() {
  try {
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const response = await fetch(
      `${BASE_URL}/${CATEGORY}.json?auth=${idToken}`,
    );

    const responseAsJSON = await response.json();
    return saveContacts(responseAsJSON);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


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


async function databaseRequest(url, method, data = null) {
  const options = {
    method: method,
    headers: { "Content-Type": "application/json" },
    ...(data && { body: JSON.stringify(data) })
  };
  const response = await fetch(url, options);
  return response.json();
}


async function addContactToDatabase(newContactData) {
  try {
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${BASE_URL}/${CATEGORY}.json?auth=${idToken}`;
    showToastMessageContactCreated();
    return await databaseRequest(url, "POST", newContactData);

    // Aktueller Stand:
    // const response = await fetch(
    //   `${BASE_URL}/${CATEGORY}.json?auth=${idToken}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(newContactData),
    //   },
    // );
    // showToastMessageContactCreated();
    // return await response.json();
  } catch (error) {
    openDialogConnectionErrorDatabase();
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
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${BASE_URL}/${CATEGORY}/${contactId}.json?auth=${idToken}`;
    showToastMessageContactEdited();
    return await databaseRequest(url, "PUT", getContactDataForDatabase());

    // Aktueller Stand:
    // const response = await fetch(
    //   `${BASE_URL}/${CATEGORY}/${contactId}.json?auth=${idToken}`,
    //   {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(getContactDataForDatabase()),
    //   },
    // );
    // showToastMessageContactEdited();
    // return await response.json();
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


async function deleteContactInDatabase(contactId) {
  try {
    await window.getCurrentUser();
    const idToken = await window.auth.currentUser.getIdToken();
    const url = `${BASE_URL}/${CATEGORY}/${contactId}.json?auth=${idToken}`;
    showToastMessageContactDeleted();
    return await databaseRequest(url, "DELETE");

    // Aktueller Stand:
    // const response = await fetch(
    //   `${BASE_URL}/${CATEGORY}/${contactId}.json?auth=${idToken}`,
    //   {
    //     method: "DELETE",
    //   },
    // );
    // showToastMessageContactDeleted();
    // return await response.json();
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}
