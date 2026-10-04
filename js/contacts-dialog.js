// JavaScript file for contacts dialog

// Variables:

const dialogBox = document.getElementById("contacts-dialog");
const dialogBoxButton = document.getElementById("add-contact-menu-button");
const dialogTitle = document.getElementById("dialog-title");
const dialogSubtitle = document.getElementById("dialog-subtitle");
const dialogShortcut = document.getElementById("dialog-shortcut");
const dialogContactForm = document
  .getElementById("contacts-dialog")
  .querySelector("form");
const contactName = document.getElementById("input-contact-name-dialog");
const contactNameInput = document.getElementById("input-name-dialog");
const contactEmail = document.getElementById("input-contact-email-dialog");
const contactEmailInput = document.getElementById("input-email-dialog");
const contactPhone = document.getElementById("input-contact-phone-dialog");
const contactPhoneInput = document.getElementById("input-phone-dialog");
const dialogCreateContactButton = document.getElementById(
  "dialog-create-contact-button",
);
const dialogCancelButton = document.getElementById("dialog-cancel-button");
const dialogDeleteButton = document.getElementById("dialog-delete-button");
const dialogSaveButton = document.getElementById("dialog-save-button");
const messageContactCreated = document.getElementById(
  "toast-message-contact-created",
);
const messageContactEdited = document.getElementById(
  "toast-message-contact-edited",
);

const dialogErrorMessageName = document.getElementById("error-message-name");
const dialogErrorMessageEmail = document.getElementById("error-message-email");
const dialogErrorMessagePhone = document.getElementById("error-message-phone");

// Functions:

/**
 * Activates the event handling for the submission of the contact form.
 */
function activateContactFormSubmissionType() {
  dialogContactForm.addEventListener("submit", handleContactFormSubmit);
}


/**
 * Clears the contact list and renders the updated list of contacts into the HTML container. 
 */
function updateContactList() {
  contactList.innerHTML = "";
  renderContactList();
}


/**
 * Updates the UI after deleting a contact.
 */
function updateUIAfterDeleteContact() {
  updateContactList();
  backToContactList();
  renderContactDetailsDesktopPlaceholder();
}

/**
 * Deletes the selected contact in the contact list.
 * @async
 */
async function deleteContact() {
  const databaseIndex = allContacts.findIndex(
    (contact) => contact.id === currentContactData.id,
  );

  if (databaseIndex !== -1) allContacts.splice(databaseIndex, 1);

  await deleteContactInDatabase(currentContactData.id);

  updateUIAfterDeleteContact();
  closeMobileContactOptions();
  closeContactDeletion();
  closeDialog();
}


/**
 * Updates the selected contact with data from the dialog input fields.
 */
function updateCurrentContactObject() {
  currentContactData.name = contactName.value;
  currentContactData.email = contactEmail.value;
  currentContactData.phone = contactPhone.value;
  getContactShortcut(currentContactData);
  prepareContactColor(currentContactData);
}


/**
 * Locks the email input field if it is the user's own account and sets the field to read-only.
 */
function toggleEmailInput() {
  contactEmail.value = currentContactData.email;

  if (currentContactData.isOwnAccount === true) {
    contactEmail.readOnly = true;
    contactEmailInput.classList.add("readonly");
  } else {
    contactEmail.readOnly = false;
    contactEmailInput.classList.remove("readonly");
  }
}


/**
 * Saves own and guest account data in local storage and regular contacts in online database.
 * @async  
 */
async function contactSaveLocation() {
  if (currentContactData.isGuest === true) {
    myAccount = { ...currentContactData };
    localStorage.setItem("guest", JSON.stringify(myAccount));
  } else if (currentContactData.isOwnAccount === true) {
    myAccount = { ...currentContactData };
    localStorage.setItem("account", JSON.stringify(myAccount));
  } else {
    await editContactInDatabase(currentContactData.id);
  }
}


/**
 * Updates the UI after saving the contact data.
 * @param {string} contactID - Contact ID number. 
 */
function updateUIAfterSaveContactData(contactID) {
  updateContactList();
  showContactDetails(contactID);
}


/**
 * Saves the data from the contact in the contact list. Stops in case of validation errors.
 * @async
 */
async function saveContactData() {
  if (checkInputData() === false) return;

  updateCurrentContactObject();
  await contactSaveLocation();

  updateUIAfterSaveContactData(currentContactData.id);
  closeMobileContactOptions();
  closeDialog();
}


/**
 * Shows the data of the selected contact. 
 */
function showContactData() {
  const shortcutColor = calculateContactIconColor(currentContactData.shortcut);

  dialogShortcut.innerHTML = currentContactData.shortcut;
  dialogShortcut.classList.add("contact-details-shortcut");
  dialogShortcut.style.setProperty("--background-color", shortcutColor);

  contactName.value = currentContactData.name;
  contactEmail.value = currentContactData.email;
  contactPhone.value = currentContactData.phone;
}


/**
 * Opens the edit dialog and loads the current contact data.
 */
function editContactDetails() {
  dialogContactForm.setAttribute("data-mode", "edit");
  dialogTitle.textContent = "Edit contact";
  dialogSubtitle.style.display = "none";

  showContactData();
  toggleEmailInput();
  dialogCreateContactButton.classList.add("hidden");
  dialogCancelButton.classList.add("hidden");
  dialogDeleteButton.classList.remove("hidden");
  dialogSaveButton.classList.remove("hidden");

  dialogBox.showModal();
}


/**
 * Opens the add contact dialog.
 */
function openDialog() {
  dialogContactForm.setAttribute("data-mode", "create");
  dialogTitle.textContent = "Add contact";
  dialogSubtitle.style.display = "flex";

  dialogCreateContactButton.classList.remove("hidden");
  dialogCancelButton.classList.remove("hidden");
  dialogDeleteButton.classList.add("hidden");
  dialogSaveButton.classList.add("hidden");

  resetFormInputs();
  dialogBox.showModal();
}


/**
 * Closes the dialog for add or edit contact.
 */
function closeDialog() {
  resetFormInputs();
  clearErrorMessages();
  dialogShortcut.classList.remove("contact-details-shortcut");
  contactEmailInput.classList.remove("readonly");
  closeMobileContactOptions();
  dialogBox.close();
}


/**
 * Closes the dialog for add or edit contact as soon as clicking outside the content.
 */
function closeDialogBackgroundClick() {
  resetFormInputs();
  
  dialogBox.addEventListener("click", (event) => {
    if (event.target === dialogBox) {
      closeDialog();
    }
  });
}


/**
 * Hides the toast message that a new contact has been created.
 */
function hideToastMessageContactCreated() {
  messageContactCreated.classList.remove("show");
}


/**
 * Shows the toast message that a new contact has been created.
 */
function showToastMessageContactCreated() {
  messageContactCreated.classList.add("show");
  setTimeout(hideToastMessageContactCreated, 3000);
}


/**
 * Opens the dialog for delete a contact.
 */
function openDialogDeleteQuestion() {
  const currentContact = allContacts.find(
    (contact) => contact.id === currentContactData.id,
  );

  if (!currentContact) return;

  if (currentContact.isOwnAccount || currentContact.isGuest) {
    showToastMessageOwnAccountNoDelete();
    contactEmailInput.classList.remove("readonly");
    return;
  }

  dialogBoxDeleteQuestion.showModal();
}


/**
 * Closes the dialog for delete a contact.
 */
function closeContactDeletion() {
  dialogBoxDeleteQuestion.close();
}


/**
 * Hides the toast message that a contact has been edited.
 */
function hideToastMessageContactEdited() {
  messageContactEdited.classList.remove("show");
}


/**
 * Shows the toast message that a contact has been edited.
 */
function showToastMessageContactEdited() {
  messageContactEdited.classList.add("show");
  setTimeout(hideToastMessageContactEdited, 3000);
}


/**
 * Hides the toast message that a contact has been deleted.
 */
function hideToastMessageContactDeleted() {
  messageContactDeleted.classList.remove("show");
}


/**
 * Shows the toast message that a contact has been deleted.
 */
function showToastMessageContactDeleted() {
  messageContactDeleted.classList.add("show");
  setTimeout(hideToastMessageContactDeleted, 3000);
}


/**
 * Resets all dialog input fields and restores the standard shortcut design.
 */
function resetFormInputs() {
  const inputFields = dialogBox.querySelectorAll("input");
  dialogContactForm.reset();

  inputFields.forEach(input => {
    input.setAttribute("aria-invalid", "false");
  });

  dialogShortcut.innerHTML =
    '<img src="../assets/icons/contacts/person_icon.png" alt="Contacts icon">';
  dialogShortcut.style.removeProperty("--background-color");
}


/**
 * Creates the contact object from the form inputs.
 * @returns {Object} The contact object with all attributes.
 */
function createContactObject() {
  return {
    name: contactName.value,
    email: contactEmail.value,
    phone: contactPhone.value,
  };
}


/**
 * Assigns the response from the database to the contact.
 * @param {Object} newContactData - Object with data of shortcut and shortcut color. 
 * @param {Object} databaseResponse - Object returned by the database.
 */
function assignDatabaseResponseToContact(newContactData, databaseResponse) {
  if (databaseResponse && databaseResponse.name) {
    newContactData.id = databaseResponse.name;
  } else {
    console.error("No database ID generated!");
  }
}


/**
 * Assigns the shortcut and shortcut color to the contact object.
 * @returns {Object} New contact object.
 */
function assignShortcutAndColorToContact() {
  const newContactData = createContactObject();
  getContactShortcut(newContactData);
  prepareContactColor(newContactData);
  return newContactData;
}


/**
 * Validates, creates and saves a new contact and updates the UI.
 * @async
 */
async function createContact() {
  if (checkInputData() === false) return;
  const newContactData = assignShortcutAndColorToContact();
  const databaseResponse = await addContactToDatabase(newContactData);
  assignDatabaseResponseToContact(newContactData, databaseResponse);
  allContacts.push(newContactData);
  updateContactList();
  clearErrorMessages();
  closeDialog();
}


/**
 * Clears all error messages of the input fields.
 */
function clearErrorMessages() {
  dialogErrorMessageName.classList.remove("show");
  dialogErrorMessageEmail.classList.remove("show");
  dialogErrorMessagePhone.classList.remove("show");

  contactNameInput.classList.remove("error-message");
  contactEmailInput.classList.remove("error-message");
  contactPhoneInput.classList.remove("error-message");
}


/**
 * Checks if the name input field is filled in.
 * @returns {boolean} True if the name input is valid, otherwise false.
 */
function checkInputName() {
  const contactNameData = contactName.value.trim();

  if (contactNameData === "") {
    dialogErrorMessageName.classList.add("show");
    contactName.setAttribute("aria-invalid", "true"); 
    contactNameInput.classList.add("error-message"); 
    return false;
  }
  dialogErrorMessageName.classList.remove("show");
  contactName.setAttribute("aria-invalid", "false");
  contactNameInput.classList.remove("error-message");
  return true;
}


/**
 * Validates the email input format.
 * @returns {boolean} True if the email input is valid, otherwise false.
 */
function checkInputEmail() {
  const contactEmailData = contactEmail.value.trim();

  if (contactEmailData !== "" && !contactEmailData.includes("@")) {
    dialogErrorMessageEmail.classList.add("show");
    contactEmail.setAttribute("aria-invalid", "true");
    contactEmailInput.classList.add("error-message");
    return false;
  }
  dialogErrorMessageEmail.classList.remove("show");
  contactEmail.setAttribute("aria-invalid", "false");
  contactEmailInput.classList.remove("error-message");
  return true;
}


/**
 * Checks the phone number for valid characters.
 * @returns {boolean} True if the format is valid, otherwise false.
 */
function checkInputPhone() {
  const contactPhoneData = contactPhone.value.trim();

  if (contactPhoneData !== "" && !/^\+?[0-9\s]+$/.test(contactPhoneData)) {
    dialogErrorMessagePhone.classList.add("show");
    contactPhone.setAttribute("aria-invalid", "true");
    contactPhoneInput.classList.add("error-message");
    return false;
  }
  dialogErrorMessagePhone.classList.remove("show");
  contactPhone.setAttribute("aria-invalid", "false");
  contactPhoneInput.classList.remove("error-message");
  return true;
}


/**
 * Checks all input fields for completeness and correct formats.
 * @returns {boolean} True if all input fields are valid, otherwise false.
 */
function checkInputData() {
  const nameData = checkInputName();
  const emailData = checkInputEmail();
  const phoneData = checkInputPhone();

  return nameData && emailData && phoneData;
}
