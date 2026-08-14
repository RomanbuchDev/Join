// JavaScript file for contact page

// Variables:
const contactList = document.getElementById('contact-list');
const contactListGrid = document.getElementById('contact-grid');
const contactDetails = document.getElementById('contact-details');
const contactOptionMenu = document.getElementById('contact-options');
const contactOptionMenuOverlay = document.getElementById('contact-options-overlay');

const dialogBoxAddContact = document.getElementById('add-contact-dialog');
const addContactForm = document.getElementById('add-contact-dialog').querySelector('form');
const contactName = document.getElementById('input-contact-name-dialog');
const contactEmail = document.getElementById('input-contact-email-dialog');
const contactPhone = document.getElementById('input-contact-phone-dialog');
const messageContactCreated = document.getElementById('toast-message-contact-created');




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





// Functions:

function init() {
  renderContactList();
}


function getContactShortcut(contactData) {
  const contactNameParts = contactData.name.split(" ");

  const firstNameLetter = contactNameParts[0][0];
  const LastNameLetter = contactNameParts[1][0];

  const contact = allContacts.find((name) => name.id === contactData.id);

  if (contact) {
    contact.shortcut = firstNameLetter + LastNameLetter;
  }
}

function renderContactList() {
    contactListGrid.innerHTML = '';

    let contactListData = [];

    for (let i = 0; i < allContacts.length; i++) {
        const contactData = allContacts[i];
        getContactShortcut(contactData);
        contactListData += getContactTemplate(contactData);         
    }
    contactListGrid.innerHTML = contactListData;
}

function showContactDetails(contactID) {
  toggleContactPageView(contactDetails, contactList);

  contactDetails.innerHTML = "";

  const contact = allContacts.find((name) => name.id === contactID);
  const contactDetailsData = getContactDetailsTemplate(contact);

  contactDetails.innerHTML = contactDetailsData;
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
  allContacts.push({
    name: contactName.value,
    email: contactEmail.value,
    phone: contactPhone.value,
  });
  resetFormInputs();
  showToastMessageContactCreated();

  console.log(allContacts);
}





// Templates:

function getContactTemplate(contactData) {
    return `<button type="button" class="contact-card" onclick="showContactDetails(${contactData.id})">
            <span class="contact-shortcut">${contactData.shortcut}</span>
            <div>
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
          <span class="title-underline"></span>
        </div>
        <button type="button" class="contact-details-back-button" onclick="backToContactList()">&#x1F860;</button>
      </div>

      <!-- Contact details main -->
      <div class="contact-details-name-container">
        <span class="contact-details-shortcut">${contactData.shortcut}</span>
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
      </button>`
}