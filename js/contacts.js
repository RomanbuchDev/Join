// JavaScript file for contact page

// Variables:

const contactList = document.getElementById("contact-list");
const contactListGrid = document.getElementById("contact-grid");
const contactDetails = document.getElementById("contact-details");
const contactOptionMenu = document.getElementById("contact-options");
const contactOptionMenuOverlay = document.getElementById(
  "contact-options-overlay",
);

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

// Functions:

function init() {
  renderContactList();
  activateContactFormSubmissionType();
  renderContactDetailsDesktopPlaceholder();
  closeDialogBackgroundClick();
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

  const firstNameLetter = correctShortcut[0] || "X";
  const LastNameLetter = correctShortcut[1] || firstNameLetter;

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
  const contactNameParts = contact.name.trim().split(/\s+/);

  const shortcut =
    contactNameParts.length > 1
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
}


function backToContactList() {
  toggleContactPageView(contactList, contactDetails);

  dialogBoxButton.classList.remove("hidden");
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
