// JavaScript file for contacts dialog

// #region Variables:

const dialogBox = document.getElementById("contacts-dialog");
const dialogBoxButton = document.getElementById("add-contact-menu-button");
const dialogTitle = document.getElementById("dialog-title");
const dialogSubtitle = document.getElementById("dialog-subtitle");
const dialogShortcut = document.getElementById("dialog-shortcut");
const dialogContactForm = document.querySelector("#contacts-dialog form");
const contactName = document.getElementById("input-contact-name-dialog");
const contactNameInput = document.getElementById("input-name-dialog");
const contactEmail = document.getElementById("input-contact-email-dialog");
const contactEmailInput = document.getElementById("input-email-dialog");
const contactPhone = document.getElementById("input-contact-phone-dialog");
const contactPhoneInput = document.getElementById("input-phone-dialog");
const dialogCreateContactButton = document.getElementById("dialog-create-contact-button");
const dialogCancelButton = document.getElementById("dialog-cancel-button");
const dialogDeleteButton = document.getElementById("dialog-delete-button");
const dialogSaveButton = document.getElementById("dialog-save-button");
const dialogErrorMessageName = document.getElementById("error-message-name");
const dialogErrorMessageEmail = document.getElementById("error-message-email");
const dialogErrorMessagePhone = document.getElementById("error-message-phone");
const originalErrorMessageName = dialogErrorMessageName.textContent;
const originalErrorMessageEmail = dialogErrorMessageEmail.textContent;
const originalErrorMessagePhone = dialogErrorMessagePhone.textContent;

// #region Functions:

/** Activates the event handling for the submission of the contact form. */
function activateContactFormSubmissionType() {
  dialogContactForm.addEventListener("submit", handleContactFormSubmit);
}


/** Updates the UI after deleting a contact. */
function updateUIAfterDeleteContact() {
  renderContactList();
  backToContactList();
  renderContactDetailsDesktopPlaceholder();
}


/**
 * Deletes the selected contact in the contact list.
 * @async
 */
async function deleteContact() {
  const databaseIndex = allContacts.findIndex((contact) => contact.id === currentContactData.id);

  if (databaseIndex !== -1) allContacts.splice(databaseIndex, 1);

  await deleteContactInDatabase(currentContactData.id);
  updateUIAfterDeleteContact();
  closeMobileContactOptions();
  closeContactDeletion();
  closeDialog();
}


/** Updates the selected contact with data from the dialog input fields. */
function updateCurrentContactObject() {
  currentContactData.name = contactName.value;
  currentContactData.email = contactEmail.value;
  currentContactData.phone = contactPhone.value;
  getContactShortcut(currentContactData);
  prepareContactColor(currentContactData);
}


/** Locks the email input field if it is the user's own account and sets the field to read-only. */
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
  renderContactList();
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


/** Shows the data of the selected contact. */
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
 * Toggles the dialog buttons depending on the dialog type.
 * @param {boolean} addContactDialogType - True if adding a new contact, false if editing an existing contact.
 */
function toggleDialogType(addContactDialogType) {
  dialogCreateContactButton.classList.toggle("hidden", !addContactDialogType);
  dialogCancelButton.classList.toggle("hidden", !addContactDialogType);
  dialogDeleteButton.classList.toggle("hidden", addContactDialogType);
  dialogSaveButton.classList.toggle("hidden", addContactDialogType);
}


/** Opens the edit dialog and loads the current contact data. */
function editContactDetails() {
  dialogContactForm.setAttribute("data-mode", "edit");
  dialogTitle.textContent = "Edit contact";
  dialogSubtitle.style.display = "none";
  toggleDialogType(false);
  showContactData();
  toggleEmailInput();
  dialogBox.showModal();
}


/** Opens the add contact dialog. */
function openDialog() {
  dialogContactForm.setAttribute("data-mode", "create");
  dialogTitle.textContent = "Add contact";
  dialogSubtitle.style.display = "flex";
  toggleDialogType(true);
  resetFormInputs();
  dialogBox.showModal();
}


/** Closes the dialog for add or edit contact. */
function closeDialog() {
  resetFormInputs();
  clearErrorMessages();
  dialogShortcut.classList.remove("contact-details-shortcut");
  contactEmailInput.classList.remove("readonly");
  closeMobileContactOptions();
  dialogBox.close();
}


/** Closes the dialog for add or edit contact as soon as clicking outside the content. */
function closeDialogBackgroundClick() {
  dialogBox.addEventListener("click", (event) => {
    if (event.target === dialogBox) closeDialog();
  });
}


/** Opens the dialog for delete a contact. */
function openDialogDeleteQuestion() {
  const currentContact = allContacts.find((contact) => contact.id === currentContactData.id);

  if (currentContact.isOwnAccount || currentContact.isGuest) {
    showToastMessage("Cannot delete own account", "toast-message-own-account-no-delete");
    return;
  }
  dialogBoxDeleteQuestion.showModal();
}


/** Closes the dialog for delete a contact. */
function closeContactDeletion() {
  dialogBoxDeleteQuestion.close();
}


/** Resets all dialog input fields and restores the standard shortcut design. */
function resetFormInputs() {
  const inputFields = dialogBox.querySelectorAll("input");
  dialogContactForm.reset();

  contactEmail.readOnly = false;
  contactEmailInput.removeAttribute("readonly");

  inputFields.forEach(input => input.setAttribute("aria-invalid", "false"));

  dialogShortcut.innerHTML = '<img src="../assets/icons/contacts/person_icon.png" alt="Contacts icon">';
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
  renderContactList();
  clearErrorMessages();
  closeDialog();
}


/** Clears all error messages of the input fields. */
function clearErrorMessages() {
  dialogErrorMessageName.classList.remove("show");
  dialogErrorMessageEmail.classList.remove("show");
  dialogErrorMessagePhone.classList.remove("show");
  contactNameInput.classList.remove("input-error");
  contactEmailInput.classList.remove("input-error");
  contactPhoneInput.classList.remove("input-error");
}


/**
 * Toggles the error messages of the input fields.
 * @param {HTMLInputElement} input - The input field.
 * @param {HTMLDivElement} inputContainer - The container of the input field.
 * @param {HTMLSpanElement} errorMessage - The text element displaying the error.
 * @param {boolean} valid - The requirement of the input field.
 * @returns {boolean} The status of the checking.
 */
function toggleInputError({ input, inputContainer, errorMessage, valid }) {
  errorMessage.classList.toggle("show", !valid);
  input.setAttribute("aria-invalid", !valid ? "true" : "false");
  inputContainer.classList.toggle("input-error", !valid);
  return valid;
}


/**
 * Checks if the name input field is filled in.
 * @returns {boolean} True if the name input is valid, otherwise false.
 */
function checkInputName() {
  const inputLength = contactName.value.trim().length > 20;
  dialogErrorMessageName.textContent = inputLength ? "Only 20 characters allowed for name." : originalErrorMessageName;
  const valid = contactName.value.trim() !== "" && !inputLength;
  return toggleInputError({
    input: contactName,
    inputContainer: contactNameInput,
    errorMessage: dialogErrorMessageName,
    valid: valid,
  });
}


/**
 * Validates the email input format.
 * @returns {boolean} True if the email input is valid, otherwise false.
 */
function checkInputEmail() {
  const data = contactEmail.value.trim();
  const inputLength = data.length > 40;
  dialogErrorMessageEmail.textContent = inputLength ? "Only 40 characters allowed for email." : originalErrorMessageEmail;
  const valid = (data === "" || data.includes("@")) && !inputLength;
  return toggleInputError({
    input: contactEmail,
    inputContainer: contactEmailInput,
    errorMessage: dialogErrorMessageEmail,
    valid: valid,
  });
}


/**
 * Checks the phone number for valid characters.
 * @returns {boolean} True if the format is valid, otherwise false.
 */
function checkInputPhone() {
  const data = contactPhone.value.trim();
  const inputLength = data.length > 20;
  dialogErrorMessagePhone.textContent = inputLength ? "Only 20 characters allowed for phone." : originalErrorMessagePhone;
  const valid = (data === "" || /^\+?[0-9\s]+$/.test(data)) && !inputLength;
  return toggleInputError({
    input: contactPhone,
    inputContainer: contactPhoneInput,
    errorMessage: dialogErrorMessagePhone,
    valid: valid,
  });
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
