// JavaScript file for contact page

// Variables:
const contactList = document.getElementById("contact-list");
const contactListGrid = document.getElementById("contact-grid");
const contactDetails = document.getElementById("contact-details");
const contactOptionMenu = document.getElementById("contact-options");
const contactOptionMenuOverlay = document.getElementById("contact-options-overlay");

const dialogBox = document.getElementById("contacts-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogSubtitle = document.getElementById("dialog-subtitle");
const dialogShortcut = document.getElementById("dialog-shortcut");
const dialogContactForm = document.getElementById("contacts-dialog").querySelector("form");
const contactName = document.getElementById("input-contact-name-dialog");
const contactEmail = document.getElementById("input-contact-email-dialog");
const contactPhone = document.getElementById("input-contact-phone-dialog");
const dialogCreateContactButton = document.getElementById("dialog-create-contact-button");
const dialogDeleteButton = document.getElementById("dialog-delete-button");
const dialogSaveButton = document.getElementById("dialog-save-button");
const messageContactCreated = document.getElementById("toast-message-contact-created");

let currentContactData;

// Database (for test only):

const allContacts = [
  {
    id: 1,
    name: "Anton Mayer",
    email: "antonm@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 2,
    name: "Anja Schulz",
    email: "schulz@hotmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 3,
    name: "Benedikt Ziegler",
    email: "benedikt@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 4,
    name: "David Eisenberg",
    email: "davidberg@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 5,
    name: "Eva Fischer",
    email: "eva@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 6,
    name: "Emmanuel Mauer",
    email: "emmanuelma@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 7,
    name: "Marcel Bauer",
    email: "bauer@gmail.com",
    phone: "+49 123 4567890",
  },
  {
    id: 8,
    name: "Tatjana Wolf",
    email: "wolf@gmail.com",
    phone: "+49 123 4567890",
  },
];

const contactListCategory = [];

// Functions:

function init() {
  renderContactList();
  console.log(allContacts);
}


function assignAndCreateContacts(letter, contact, lastNameLetter) {
  const contactCategoryGrid = document.getElementById(
    "contact-grid-" + lastNameLetter,
  );

  if (lastNameLetter === letter) {
    contactCategoryGrid.innerHTML += getContactTemplate(contact);
  }
}


function getLastNameLetter(contact) {
  const contactNameParts = contact.name.split(" ");

  const letter = contactNameParts[1]
    ? contactNameParts[1][0]
    : contactNameParts[0][0];

  return letter;
}


function createAlphabetList() {
  const letters = new Set();

  for (let i = 0; i < allContacts.length; i++) {
    const contact = allContacts[i];
    const currentLetter = getLastNameLetter(contact);
    letters.add(currentLetter);
  }

  const alphabetList = Array.from(letters);
  sortAlphabetList(alphabetList);

  return alphabetList;
}


function sortAlphabetList(alphabetList) {
  alphabetList.sort();
}


function calculateContactIconColor(contactShortcut) {
  const correctShortcut = contactShortcut.toUpperCase();

  const firstNameLetter = correctShortcut[0];
  const LastNameLetter = correctShortcut[1];

  const value1 = firstNameLetter.charCodeAt(0) - 65;
  const value2 = LastNameLetter.charCodeAt(0) - 65;

  const r = (40 + value1 * 7).toFixed(0);
  const g = (40 + value2 * 7).toFixed(0);
  const b = (40 + (25 - value2) * 7).toFixed(0);

  return `rgba(${r}, ${g}, ${b}, 1)`;
}


function setContactIconColor(contactID, shortcutColor) {
  if (contactID) {
    contactID.style.setProperty("--background-color", shortcutColor);
  }
}


function getContactShortcut(contact) {
  const contactNameParts = contact.name.split(" ");

  const shortcut = contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  contact.shortcut = shortcut.toUpperCase();
}


function addContactIconColorToContactList(contact) {
  const contactID = document.getElementById(`contact-${contact.id}`);
  const shortcutColor = calculateContactIconColor(contact.shortcut);

  setContactIconColor(contactID, shortcutColor);
}


function renderContactList() {
  const letters = createAlphabetList();

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    contactList.innerHTML += getLetterCategoryTemplate(letter);

    for (let j = 0; j < allContacts.length; j++) {
      const contact = allContacts[j];
      const lastNameLetter = getLastNameLetter(contact);
      getContactShortcut(contact);
      assignAndCreateContacts(letter, contact, lastNameLetter);
      addContactIconColorToContactList(contact);
    }
  }
}


function showContactDetails(contactID) {
  toggleContactPageView(contactDetails, contactList);

  contactDetails.innerHTML = "";

  const contact = allContacts.find((name) => name.id === contactID);
  currentContactData = contact;
  const contactDetailsData = getContactDetailsTemplate(contact);

  const contactNameParts = contact.name.split(" ");

  const shortcut = contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  contactDetails.innerHTML = contactDetailsData;

  const contactShortcutID = document.getElementById(`contact-details-shortcut-${contact.id}`);

  const shortcutColor = calculateContactIconColor(shortcut);
  setContactIconColor(contactShortcutID, shortcutColor);
}


function backToContactList() {
  toggleContactPageView(contactList, contactDetails);
}


function toggleContactPageView(show, hide) {
  show.classList.remove("hidden");
  hide.classList.add("hidden");
}


function toggleMobileContactOptions() {
  if (contactOptionMenu && contactOptionMenuOverlay) {
    contactOptionMenu.classList.add("show");
    contactOptionMenuOverlay.classList.add("show");
  }
}


function closeMobileContactOptions() {
  contactOptionMenu.classList.remove("show");
  contactOptionMenuOverlay.classList.remove("show");
}


function deleteContact() {
  const databaseIndex = allContacts.findIndex((contact) => contact.id === currentContactData.id);

  if (databaseIndex !== -1) {
    allContacts.splice(databaseIndex, 1);
  }
  closeMobileContactOptions();
  contactList.innerHTML = "";
  renderContactList();
  backToContactList();
}


function saveContactData() {
  currentContactData.name = contactName.value;
  currentContactData.email = contactEmail.value;
  currentContactData.phone = contactPhone.value;

  contactList.innerHTML = "";
  renderContactList();
  showContactDetails(currentContactData.id);
  closeMobileContactOptions();
}


function showContactData() {
  const shortcutColor = calculateContactIconColor(currentContactData.shortcut);

  dialogShortcut.innerHTML = currentContactData.shortcut;
  dialogShortcut.classList.add("contact-details-shortcut");
  dialogShortcut.style.setProperty("--background-color", shortcutColor);

  contactName.value = currentContactData.name;
  contactEmail.value = currentContactData.email;
  contactPhone.value = currentContactData.phone;
}


function editContactDetails() {
  dialogTitle.textContent = "Edit contact";
  dialogSubtitle.style.display = "none";

  showContactData();

  dialogCreateContactButton.classList.add("hidden");
  dialogDeleteButton.classList.remove("hidden");
  dialogSaveButton.classList.remove("hidden");

  dialogBox.showModal();
}


function openDialogAddContact() {
  dialogTitle.textContent = "Add contact";
  dialogSubtitle.style.display = "flex";

  dialogCreateContactButton.classList.remove("hidden");
  dialogDeleteButton.classList.add("hidden");
  dialogSaveButton.classList.add("hidden");

  resetFormInputs();
  dialogBox.showModal();
}


function closeDialogAddContact() {
  resetFormInputs();
  dialogShortcut.classList.remove("contact-details-shortcut");
  dialogBox.close();
}


function hideToastMessageContactCreated() {
  messageContactCreated.classList.remove("show");
}


function showToastMessageContactCreated() {
  messageContactCreated.classList.add("show");
  setTimeout(hideToastMessageContactCreated, 3000);
}


function resetFormInputs() {
  dialogContactForm.reset();

  dialogShortcut.innerHTML = '<img src="../assets/icons/contacts/person_icon.png" alt="Contacts icon">';
  dialogShortcut.style.removeProperty("--background-color");
}


function createContact() {
  const newContactData = {
    id: allContacts.length > 0 ? allContacts[allContacts.length - 1].id + 1 : 1,
    name: contactName.value,
    email: contactEmail.value,
    phone: contactPhone.value,
  };

  getContactShortcut(newContactData);
  allContacts.push(newContactData);

  contactList.innerHTML = "";
  renderContactList();
  resetFormInputs();
  showToastMessageContactCreated();
}
