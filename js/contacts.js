// JavaScript file for contact page

// Variables:

const contactList = document.getElementById("contact-list");
const contactListGrid = document.getElementById("contact-grid");
const contactDetails = document.getElementById("contact-details");
const contactOptionMenu = document.getElementById("contact-options");
const contactOptionMenuOverlay = document.getElementById(
  "contact-options-overlay",
);
const mainView = document.getElementById("main-view");

const dialogBoxDeleteQuestion = document.getElementById(
  "delete-question-dialog",
);
const messageContactEdited = document.getElementById(
  "toast-message-contact-edited",
);
const messageContactDeleted = document.getElementById(
  "toast-message-contact-deleted",
);

let currentContactData;

// Database (for test only):

// const allContacts = [
//   {
//     id: 1,
//     name: "Anton Mayer",
//     email: "antonm@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 2,
//     name: "Anja Schulz",
//     email: "schulz@hotmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 3,
//     name: "Benedikt Ziegler",
//     email: "benedikt@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 4,
//     name: "David Eisenberg",
//     email: "davidberg@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 5,
//     name: "Eva Fischer",
//     email: "eva@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 6,
//     name: "Emmanuel Mauer",
//     email: "emmanuelma@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 7,
//     name: "Marcel Bauer",
//     email: "bauer@gmail.com",
//     phone: "+49 123 4567890",
//   },
//   {
//     id: 8,
//     name: "Tatjana Wolf",
//     email: "wolf@gmail.com",
//     phone: "+49 123 4567890",
//   },
// ];

// Functions:

async function init() {
  await fetchAllContacts();
  renderContactList();
  activateContactFormSubmissionType();
  renderContactDetailsDesktopPlaceholder();
  closeDialogBackgroundClick();
  console.log(allContacts);
}


function saveContacts(responseAsJSON) {
  for (let index = 0; index < responseAsJSON.length; index++) {
    const contact = responseAsJSON[index];
    getContactShortcut(contact);
    prepareContactColor(contact);
    allContacts.push(contact);
  }
  return allContacts;
}


async function fetchAllContacts() {
  try {
    const response = await fetch("../js/contact-list.json");
    const responseAsJSON = await response.json();
    return saveContacts(responseAsJSON);
  } catch (error) {
    console.error("Error loading data!", error);
  }
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


function setContactIconColor(contactID, shortcutColor) {
  if (contactID) {
    contactID.style.setProperty("--background-color", shortcutColor);
  }
}


function addContactIconColorToContactList(contact) {
  const contactID = document.getElementById(`contact-${contact.id}`);
  const shortcutColor = calculateContactIconColor(contact.shortcut);
  // const shortcutColor = contact.shortcutColor;

  setContactIconColor(contactID, shortcutColor);
}


function renderContactsByLetter(letter) {
  for (let j = 0; j < allContacts.length; j++) {
    const contact = allContacts[j];
    const lastNameLetter = getLastNameLetter(contact);
    getContactShortcut(contact);
    assignAndCreateContacts(letter, contact, lastNameLetter);
    addContactIconColorToContactList(contact);
  }
}


async function renderContactList() {
  const letters = createAlphabetList();
  contactList.innerHTML = "";

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    contactList.innerHTML += getLetterCategoryTemplate(letter);
    renderContactsByLetter(letter);
  }
}


function createContactShortcut(name) {
  const contactNameParts = name.split(" ");

  const shortcut =
    contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  return shortcut;
}


function highlightActivteContact(contactID) {
  const allContacts = document.querySelectorAll(".contact-card");
  allContacts.forEach((contact) => contact.classList.remove("active"));

  if (window.innerWidth >= 1024) {
    const activeContact = document.getElementById(`contact-${contactID}`);

    if (activeContact) {
      activeContact.classList.add("active");
    }
  }
}


function showContactDetailsDesktopAnimation() {
  setTimeout(() => {
    contactDetails.classList.add("show-animation");
  }, 10);
}


function renderContactDetails(contactID) {
  const contact = allContacts.find((name) => name.id === contactID);
  const shortcut = createContactShortcut(contact.name);
  currentContactData = contact;
  const contactDetailsData = getContactDetailsTemplate(contact);

  contactDetails.innerHTML = contactDetailsData;

  const contactShortcutID = document.getElementById(
    `contact-details-shortcut-${contact.id}`,
  );

  const shortcutColor = calculateContactIconColor(shortcut);
  setContactIconColor(contactShortcutID, shortcutColor);
}


function showContactDetails(contactID) {
  highlightActivteContact(contactID);
  toggleContactPageView(contactDetails, contactList);
  contactDetails.classList.remove("show-animation");
  contactDetails.innerHTML = "";

  renderContactDetails(contactID);
  showContactDetailsDesktopAnimation();

  mainView.classList.add("details-open");
}


function backToContactList() {
  toggleContactPageView(contactList, contactDetails);

  dialogBoxButton.classList.remove("hidden");

  mainView.classList.remove("details-open");
}


function toggleContactPageView(show, hide) {
  show.classList.remove("hidden");
  hide.classList.add("hidden");

  dialogBoxButton.classList.add("hidden");
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


function checkContactFormValidation() {
  if (!dialogContactForm.checkValidity()) {
    dialogContactForm.reportValidity();
    return false;
  }
  return true;
}


function handleContactFormSubmit(event) {
  event.preventDefault();
  const mode = dialogContactForm.getAttribute("data-mode");

  if (mode === "edit") {
    saveContactData();
  } else {
    createContact();
  }
}


function renderContactDetailsDesktopPlaceholder() {
  if (window.innerWidth >= 1024) {
    const contactDetailsPlaceholder = getContactDetailsPlaceholderTemplate();
    contactDetails.innerHTML = contactDetailsPlaceholder;
  }
}
