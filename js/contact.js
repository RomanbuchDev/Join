// JavaScript file for contact page

// Variables:
const contactList = document.getElementById('contact-list');
const contactDetails = document.getElementById('contact-details');
const iconAddContact = document.getElementById('add-contact-icon');
const iconMoreMenu = document.getElementById('more-menu-icon');

const dialogBoxAddContact = document.getElementById('add-contact-dialog');
const addContactForm = document.getElementById('add-contact-dialog').querySelector('form');
const contactName = document.getElementById('input-contact-name-dialog');
const contactEmail = document.getElementById('input-contact-email-dialog');
const contactPhone = document.getElementById('input-contact-phone-dialog');
const messageContactCreated = document.getElementById('toast-message-contact-created');





// Database (for test only):

let allContacts = [];




// Functions:

function showContactDetails() {
    contactList.classList.add('hidden');
    contactDetails.classList.remove('hidden');

    iconAddContact.classList.replace('show', 'hidden');
    iconMoreMenu.classList.replace('hidden', 'show');
}


function backToContactList() {
    contactList.classList.remove('hidden');
    contactDetails.classList.add('hidden');
    
    iconAddContact.classList.replace('hidden', 'show');
    iconMoreMenu.classList.replace('show', 'hidden');
}


function openDialogAddContact() {
    dialogBoxAddContact.showModal();
}


function closeDialogAddContact() {
    dialogBoxAddContact.close();
}


function hideToastMessageContactCreated() {
    messageContactCreated.classList.remove('show');
}


function showToastMessageContactCreated() {
    messageContactCreated.classList.add('show');
    setTimeout(hideToastMessageContactCreated, 3000);
}


function resetFormInputs() {
    addContactForm.reset();
}


function createContact() {
    allContacts.push({
        "name": contactName.value,
        "email": contactEmail.value,
        "phone": contactPhone.value
    });
    resetFormInputs();
    showToastMessageContactCreated();

    console.log(allContacts);
}