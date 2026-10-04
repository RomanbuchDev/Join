// JavaScript file for contacts page

// Variables:

const contactList = document.getElementById("contact-list");
const contactDetails = document.getElementById("contact-details");
const contactOptionMenu = document.getElementById("contact-options");
const contactOptionMenuOverlay = document.getElementById(
  "contact-options-overlay",
);
const mainView = document.getElementById("main-view");
const dialogBoxDeleteQuestion = document.getElementById(
  "delete-question-dialog",
);
const messageContactDeleted = document.getElementById(
  "toast-message-contact-deleted",
);
const messageOwnAccountNoDelete = document.getElementById(
  "toast-message-own-account-no-delete",
);
const dialogBoxConnectionErrorDatabase = document.getElementById(
  "connection-error-database-dialog",
);

let currentContactData;
let lastScrollPosition = 0;


// Functions:

/**
 * Functions for initial page start.
 * @async
 */
async function init() {
  await fetchAllContacts();
  renderContactList();
  activateContactFormSubmissionType();
  renderContactDetailsDesktopPlaceholder();
  closeDialogBackgroundClick();
  closeMobileContactOptionsEscapeKey();
}


/**
 * Saves the last scroll position when changing the view from contact list to contact details (mobile).
 */
function lastPositionAfterWebsiteLoading() {
  if (mainView) {
    requestAnimationFrame(() => {
      mainView.scrollTo({
        top: lastScrollPosition,
        behavior: "instant",
      });
    });
  }
}


/**
 * Creates contacts and own account in the contact list. The contact list is organized by the first letter of the last name. The contacts and own account are assigned to the corresponding letter.
 * @param {string} letter - All letters from all contact last names. 
 * @param {Object} contact - Contact objects. 
 * @param {string} lastNameLetter - The first letter of every contact last name. 
 */
function assignAndCreateContacts(letter, contact, lastNameLetter) {
  const contactCategoryGrid = document.getElementById(
    "contact-grid-" + lastNameLetter,
  );

  if (lastNameLetter === letter) {
    if (contact.isOwnAccount || contact.isGuest) {
      contactCategoryGrid.innerHTML += getOwnContactTemplate(contact);
    } else {
      contactCategoryGrid.innerHTML += getContactTemplate(contact);
    }
  }
}

/**
 * Saves the first letter of every last name from the database.
 * @param {Object} contact - Contact objects.
 * @returns {string} The first letter of every contact last name.
 */
function getLastNameLetter(contact) {
  const contactNameParts = contact.name.split(" ");

  const letter = contactNameParts[1]
    ? contactNameParts[1][0]
    : contactNameParts[0][0];

  return letter;
}


/**
 * Creates the alphabet list with the first letters of all contact last names in the database.
 * @returns {string[]} A list of all letters.
 */
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


/**
 * Sorts all letters alphabetically.
 * @param {string[]} alphabetList - A list of all letters.  
 */
function sortAlphabetList(alphabetList) {
  alphabetList.sort();
}


/**
 * Sets the calculated color code to every contact ID.
 * @param {HTMLButtonElement} contactID - The contact button elements for every contact.   
 * @param {string} shortcutColor - The RGBA color string.  
 */
function setContactIconColor(contactID, shortcutColor) {
  if (contactID) {
    contactID.style.setProperty("--background-color", shortcutColor);
  }
}


/**
 * Adds the calculated contact icon color to the contact list.
 * @param {Object} contact - Contact objects.
 */
function addContactIconColorToContactList(contact) {
  const contactID = document.getElementById(`contact-${contact.id}`);
  const shortcutColor = calculateContactIconColor(contact.shortcut);

  setContactIconColor(contactID, shortcutColor);
}


/**
 * Creates the complete contact objects.
 * @param {string} letter - All letters from all contact last names.
 */
function renderContactsByLetter(letter) {
  for (let j = 0; j < allContacts.length; j++) {
    const contact = allContacts[j];
    const lastNameLetter = getLastNameLetter(contact);
    getContactShortcut(contact);
    assignAndCreateContacts(letter, contact, lastNameLetter);
    addContactIconColorToContactList(contact);
  }
}


/**
 * Renders the contact list with all contact objects into the HTML container.
 * @async
 * @returns {Promise<void>} Resolves when the HTML rendering is complete.
 */
async function renderContactList() {
  const letters = createAlphabetList();
  contactList.innerHTML = "";

  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    contactList.innerHTML += getLetterCategoryTemplate(letter);
    renderContactsByLetter(letter);
  }
}


/**
 * Creates the shortcut (first letter of first and last name) of every contact.
 * @param {string} name - The name of every contact. 
 * @returns {string} Contact shortcut.
 */
function createContactShortcut(name) {
  const contactNameParts = name.split(" ");

  const shortcut =
    contactNameParts.length > 1
      ? contactNameParts[0][0] + contactNameParts[1][0]
      : contactNameParts[0][0];

  return shortcut;
}


/**
 * Changes name font color and element background color of the contact after clicking (desktop). 
 * @param {string} contactID - Contact ID number. 
 */
function highlightActivateContact(contactID) {
  const contactCards = document.querySelectorAll(".contact-card");
  contactCards.forEach((contact) => contact.classList.remove("active"));

  if (window.innerWidth >= 1024) {
    const activeContact = document.getElementById(`contact-${contactID}`);

    if (activeContact) {
      activeContact.classList.add("active");
    }
  }
}


/**
 * Shows contact details animation when clicking on a contact in contact list (desktop).
 */
function showContactDetailsDesktopAnimation() {
  setTimeout(() => {
    contactDetails.classList.add("show-animation");
  }, 10);
}


/**
 * Renders the contact details with all data, shortcut and shortcut color into the HTML container.
 * @param {string} contactID - Contact ID number.
 */
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


/**
 * Shows the contact details in the main view (mobile) or on the right side of the page (desktop).
 * @param {string} contactID - Contact ID number.
 */
function showContactDetails(contactID) {
  lastScrollPosition = mainView.scrollTop;
  highlightActivateContact(contactID);
  toggleContactPageView(contactDetails, contactList);
  contactDetails.classList.remove("show-animation");
  contactDetails.innerHTML = "";

  renderContactDetails(contactID);
  showContactDetailsDesktopAnimation();

  mainView.classList.add("details-open");
}


/**
 * Changes the view back from contact details to contact list at the last scroll position (desktop).
 */
function backToContactList() {
  toggleContactPageView(contactList, contactDetails);

  dialogBoxButton.classList.remove("hidden");
  mainView.classList.remove("details-open");

  lastPositionAfterWebsiteLoading();
}


/**
 * Toggles the contact page view. Shows contact list and hide contact details (mobile).
 * @param {HTMLDivElement|null} show - Contact list DIV element. 
 * @param {HTMLElement|null} hide - Contact details ASIDE element.
 */
function toggleContactPageView(show, hide) {
  show.classList.remove("hidden");
  hide.classList.add("hidden");
  dialogBoxButton.classList.add("hidden");
}


/**
 * Shows the contact options menu by clicking on the contact option button in contact details view (mobile).
 */
function toggleMobileContactOptions() {
  const contactOptionMenuButton = document.getElementById("edit-contact-menu-button");
  const editButton = contactOptionMenu.querySelector(".option-button");

  if (contactOptionMenu && contactOptionMenuOverlay) {
    contactOptionMenu.classList.add("show");
    contactOptionMenuOverlay.classList.add("show");
    if (contactOptionMenuButton) contactOptionMenuButton.setAttribute("aria-expanded", "true");
    if (editButton) editButton.focus();
  }
}


/**
 * Closes the contact options menu by clicking on the background of the overlay in contact details view (mobile).
 */
function closeMobileContactOptions() {
  const contactOptionMenuButton = document.getElementById("edit-contact-menu-button");

  contactOptionMenu.classList.remove("show");
  contactOptionMenuOverlay.classList.remove("show");

  if (contactOptionMenuButton) {
    contactOptionMenuButton.setAttribute("aria-expanded", "false");
    contactOptionMenuButton.focus();
  }
}


/**
 * Closes the contact options menu by pressing the escape key in contact details view (mobile).
 */
function closeMobileContactOptionsEscapeKey() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactOptionMenu.classList.contains("show")) {
      closeMobileContactOptions();
    }
  });
}


/**
 * Processes the submission of the contact form and differs between creating and editing based on the data mode.
 * @param {SubmitEvent} event - The submit event initiated by the form.  
 */
function handleContactFormSubmit(event) {
  event.preventDefault();
  const mode = dialogContactForm.getAttribute("data-mode");

  if (mode === "edit") {
    saveContactData();
  } else {
    createContact();
  }
}


/**
 * Renders the contact details placeholder into the HTML container (desktop).
 */
function renderContactDetailsDesktopPlaceholder() {
  if (window.innerWidth >= 1024) {
    const contactDetailsPlaceholder = getContactDetailsPlaceholderTemplate();
    contactDetails.innerHTML = contactDetailsPlaceholder;
  }
}


/**
 * Shows and hides the toast message that the own account cannot be deleted.
 */
function showToastMessageOwnAccountNoDelete() {
  messageOwnAccountNoDelete.classList.add("show");
  dialogBox.close();

  setTimeout(() => {
    messageOwnAccountNoDelete.classList.remove("show");
  }, 3000);
}


/**
 * Closes the dialog window showing the database connection error.
 */
function closeDialogConnectionErrorDatabase() {
  dialogBoxConnectionErrorDatabase.close();
}


/**
 * Reloads the page.
 */
function reloadPage() {
  window.location.reload();
}


/**
 * Opens the dialog window showing the database connection error.
 */
function openDialogConnectionErrorDatabase() {
  dialogBoxConnectionErrorDatabase.showModal();
}
