// JavaScript file for contacts dialog

// Variables:

const dialogBox = document.getElementById("contacts-dialog");
const dialogBoxButton = document.getElementById("contact-menu-button");
const dialogTitle = document.getElementById("dialog-title");
const dialogSubtitle = document.getElementById("dialog-subtitle");
const dialogShortcut = document.getElementById("dialog-shortcut");
const dialogContactForm = document
  .getElementById("contacts-dialog")
  .querySelector("form");
const contactName = document.getElementById("input-contact-name-dialog");
const contactEmail = document.getElementById("input-contact-email-dialog");
const contactPhone = document.getElementById("input-contact-phone-dialog");
const dialogCreateContactButton = document.getElementById(
  "dialog-create-contact-button",
);
const dialogCancelButton = document.getElementById("dialog-cancel-button");
const dialogDeleteButton = document.getElementById("dialog-delete-button");
const dialogSaveButton = document.getElementById("dialog-save-button");
const messageContactCreated = document.getElementById(
  "toast-message-contact-created",
);

// Functions:

function activateContactFormSubmissionType() {
  dialogContactForm.addEventListener("submit", handleContactFormSubmit);
}


function updateContactList() {
    contactList.innerHTML = "";
    renderContactList();
}


function deleteContact() {
  const databaseIndex = allContacts.findIndex(
    (contact) => contact.id === currentContactData.id);

  if (databaseIndex !== -1) {
    allContacts.splice(databaseIndex, 1);
  }
  updateContactList();
  backToContactList();
  renderContactDetailsDesktopPlaceholder();
  showToastMessageContactDeleted();
  closeMobileContactOptions();
  closeContactDeletion();
  closeDialog();
}


function saveContactData() {
  if (!checkContactFormValidation()) return;
  currentContactData.name = contactName.value;
  currentContactData.email = contactEmail.value;
  currentContactData.phone = contactPhone.value;

    updateContactList();
  showContactDetails(currentContactData.id);
  showToastMessageContactEdited();
  closeMobileContactOptions();
  closeDialog();
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
  dialogContactForm.setAttribute("data-mode", "edit");
  dialogTitle.textContent = "Edit contact";
  dialogSubtitle.style.display = "none";

  showContactData();

  dialogCreateContactButton.classList.add("hidden");
  dialogCancelButton.classList.add("hidden");
  dialogDeleteButton.classList.remove("hidden");
  dialogSaveButton.classList.remove("hidden");

  dialogBox.showModal();
}


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


function closeDialog() {
  resetFormInputs();
  dialogShortcut.classList.remove("contact-details-shortcut");
  closeMobileContactOptions();
  dialogBox.close();
}


function closeDialogBackgroundClick() {
  dialogBox.addEventListener("click", (event) => {
    if (event.target === dialogBox) {
      closeDialog();
    }
  });
}


function hideToastMessageContactCreated() {
  messageContactCreated.classList.remove("show");
}


function showToastMessageContactCreated() {
  messageContactCreated.classList.add("show");
  setTimeout(hideToastMessageContactCreated, 3000);
}


function openDialogDeleteQuestion() {
  dialogBoxDeleteQuestion.showModal();
}


function closeContactDeletion() {
  dialogBoxDeleteQuestion.close();
}


function hideToastMessageContactEdited() {
  messageContactEdited.classList.remove("show");
}


function showToastMessageContactEdited() {
  messageContactEdited.classList.add("show");
  setTimeout(hideToastMessageContactEdited, 3000);
}


function hideToastMessageContactDeleted() {
  messageContactDeleted.classList.remove("show");
}


function showToastMessageContactDeleted() {
  messageContactDeleted.classList.add("show");
  setTimeout(hideToastMessageContactDeleted, 3000);
}


function resetFormInputs() {
  dialogContactForm.reset();

  dialogShortcut.innerHTML =
    '<img src="../assets/icons/contacts/person_icon.png" alt="Contacts icon">';
  dialogShortcut.style.removeProperty("--background-color");
}


function createContact() {
  if (!checkContactFormValidation()) return;
  const newContactData = {
    id: allContacts.length > 0 ? allContacts[allContacts.length - 1].id + 1 : 1,
    name: contactName.value,
    email: contactEmail.value,
    phone: contactPhone.value,
  };
  getContactShortcut(newContactData);
  allContacts.push(newContactData);
    updateContactList();
  showToastMessageContactCreated();
  closeDialog();
}


function renderContactDetailsDesktopPlaceholder() {
  if (window.innerWidth >= 1024) {
    const contactDetailsPlaceholder = getContactDetailsPlaceholderTemplate();
    contactDetails.innerHTML = contactDetailsPlaceholder;
  }
}
