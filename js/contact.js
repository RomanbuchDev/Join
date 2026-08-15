// JavaScript file for contact page

// Variables:
const contactList = document.getElementById("contact-list");
const contactListGrid = document.getElementById("contact-grid");
const contactDetails = document.getElementById("contact-details");
const contactOptionMenu = document.getElementById("contact-options");
const contactOptionMenuOverlay = document.getElementById("contact-options-overlay");

const dialogBoxAddContact = document.getElementById("add-contact-dialog");
const addContactForm = document.getElementById("add-contact-dialog").querySelector("form");
const contactName = document.getElementById("input-contact-name-dialog");
const contactEmail = document.getElementById("input-contact-email-dialog");
const contactPhone = document.getElementById("input-contact-phone-dialog");
const messageContactCreated = document.getElementById("toast-message-contact-created");


// Database (for test only):


let allContacts = [
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


let contactListCategory = [];


// Functions:

function init() {
  renderContactList();
  console.log(allContacts);
}

// Meine Version vom 13.08.2026:

// function checkFirstLetterOfContact(contactData) {
//   const firstLetter = contactData.name[0];
//   const checkFirstLetter = contactListCategory.includes(firstLetter);

//   if (checkFirstLetter !== true) {
//     contactListCategory.push(firstLetter);
//   } else {
//     return;
//   }
// }


// function renderLetterCategories() {
//   contactList.innerHTML = "";

//   let letterCategories = [];

//   for (let i = 0; i < contactListCategory.length; i++) {
//     const contactListCategoryLetters = contactListCategory[i];
//     letterCategories += getLetterCategoryTemplate(contactListCategoryLetters);
//   }
//   contactList.innerHTML = letterCategories;
// }


// function assignContactToLetterCategory(firstLetter) {
//   const contactCategoryGrid = document.getElementById(
//     "contact-grid-" + firstLetter,
//   );

//   let contactListData = "";

//   for (let i = 0; i < allContacts.length; i++) {
//     const contactData = allContacts[i];

//     if (firstLetter === contactData.name[0]) {
//       contactListData += getContactTemplate(contactData);
//     }
//   }
//   contactCategoryGrid.innerHTML = contactListData;
// }


// function setContactIconColor() {
//   for (let i = 0; i < allContacts.length; i++) {
//     const contactData = allContacts[i];
//     const shortcutColor = calculateContactIconColor(contactData.shortcut);

//     const contactID = document.getElementById(`contact-${contactData.id}`);

//     if (contactID) {
//       contactID.style.setProperty("--background-color", shortcutColor);
//     }
//   }
// }


// function calculateContactIconColor(contactShortcut) {
//   const correctShortcut = contactShortcut.toUpperCase();

//   const firstNameLetter = correctShortcut[0];
//   const LastNameLetter = correctShortcut[1];

//   const value1 = firstNameLetter.charCodeAt(0) - 65;
//   const value2 = LastNameLetter.charCodeAt(0) - 65;

//   const r = (40 + value1 * 7).toFixed(0);
//   const g = (40 + value2 * 7).toFixed(0);
//   const b = (40 + (25 - value2) * 7).toFixed(0);

//   return `rgba(${r}, ${g}, ${b}, 1)`;
// }


// function getContactShortcut(contactData) {
//   const contactNameParts = contactData.name.split(" ");

//   const firstNameLetter = contactNameParts[0][0];
//   const LastNameLetter = contactNameParts[1][0];

//   const contact = allContacts.find((name) => name.id === contactData.id);

//   if (contact) {
//     contact.shortcut = firstNameLetter + LastNameLetter;
//   }
// }


// function renderContactList() {
//   let contactListData = [];

//   for (let i = 0; i < allContacts.length; i++) {
//     const contactData = allContacts[i];
//     getContactShortcut(contactData);
//     checkFirstLetterOfContact(contactData);
//   }
//   renderLetterCategories();

//   for (let i = 0; i < contactListCategory.length; i++) {
//     assignContactToLetterCategory(contactListCategory[i]);
//   }
//   setContactIconColor();
// }


// Alternative vom 14.08.2026:

function assignAndCreateContacts(letter, contact, lastNameLetter) {
  const contactCategoryGrid = document.getElementById("contact-grid-" + lastNameLetter);
  console.log(letter, contact, lastNameLetter);
  
  if (lastNameLetter === letter) {
    contactCategoryGrid.innerHTML += getContactTemplate(contact);
  }
}


function getLastNameLetter(contact) {
  const contactNameParts = contact.name.split(' ');

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
  const contactNameParts = contact.name.split(' ');

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


// Ab hier die bisherigen Funktionen vor dem 14.08.2026:

function showContactDetails(contactID) {
  toggleContactPageView(contactDetails, contactList);

  contactDetails.innerHTML = "";

  const contact = allContacts.find((name) => name.id === contactID);
  const contactDetailsData = getContactDetailsTemplate(contact);

  const contactNameParts = contact.name.split(' ');
  
  const shortcut = contactNameParts.length > 1
    ? contactNameParts[0][0] + contactNameParts[1][0]
    : contactNameParts[0][0];

  contactDetails.innerHTML = contactDetailsData;

  const contactID2 = document.getElementById(`contact-details-shortcut-${contact.id}`);

  const shortcutColor = calculateContactIconColor(shortcut);
  setContactIconColor(contactID2, shortcutColor);
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


// Dialog

function openDialogAddContact() {
  dialogBoxAddContact.showModal();
}


function closeDialogAddContact() {
  dialogBoxAddContact.close();
}


function hideToastMessageContactCreated() {
  messageContactCreated.classList.remove("show");
}


function showToastMessageContactCreated() {
  messageContactCreated.classList.add("show");
  setTimeout(hideToastMessageContactCreated, 3000);
}


function resetFormInputs() {
  addContactForm.reset();
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

  contactList.innerHTML = '';
  renderContactList();  
  resetFormInputs();
  showToastMessageContactCreated();
}


// Templates:

function getContactTemplate(contactData) {
  return `<button type="button" class="contact-card" id="contact-${contactData.id}" onclick="showContactDetails(${contactData.id})">
            <span class="contact-shortcut">${contactData.shortcut}</span>
            <div class="contact-data-container">
              <span class="contact-name">${contactData.name}</span>
              <span class="contact-e-mail">${contactData.email}</span>
            </div>
          </button>`;
}


function getContactDetailsTemplate(contactData) {
  return `<div class="contact-details-header-container">
        <div class="contact-details-title-container">
          <span class="contact-details-title">Contacts</span>
          <span class="contact-details-subtitle">Better with a team</span>
        </div>
        <button type="button" class="contact-details-back-button" onclick="backToContactList()">&#x1F860;</button>
      </div>

      <!-- Contact details main -->
      <div class="contact-details-name-container">
        <span class="contact-details-shortcut" id="contact-details-shortcut-${contactData.id}">${contactData.shortcut}</span>
        <span class="contact-details-name">${contactData.name}</span>
      </div>

      <!-- Contact details information -->
      <div>
        <div class="contact-details-information-container">
          <h3>Contact information</h3>
        </div>
        <div class="contact-details-contact-data">
          <h4>Email</h4>
          <span class="contact-e-mail">${contactData.email}</span>
          <h4>Phone</h4>
          <span>${contactData.phone}</span>
        </div>
      </div>

      <!-- Contact details option menu button -->
      <button class="contact-menu" onclick="toggleMobileContactOptions()">
        <img src="../assets/icons/contacts/contact_options_icon.png" alt="Contact options button mobile">
      </button>`;
}


// Test:
function getLetterCategoryTemplate(letter) {
  return `<section id="letter-category-${letter}">
        <div>
          <h2 class="letter-container">${letter}</h2>
          <hr class="letter-line">
        </div>
        <div id="contact-grid-${letter}">
        </div>
      </section>`;
}
