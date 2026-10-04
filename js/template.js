// Templates - Contacts page


/**
 * Creates the HTML structure for contacts in the contact list.
 * @param {Object} contactData - Object with contact data.
 * @returns {string} The HTML item for the contact.
 */
function getContactTemplate(contactData) {
  return `<button type="button" class="contact-card" id="contact-${contactData.id}" onclick="showContactDetails('${contactData.id}')">
            <span class="contact-shortcut">${contactData.shortcut}</span>
            <div class="contact-data-container">
              <span class="contact-name">${contactData.name}</span>
              <span class="contact-e-mail">${contactData.email}</span>
            </div>
          </button>`;
}


/**
 * Creates the HTML structure for the own account or guest account in the contact list.
 * @param {Object} contactData - Object with contact data.
 * @returns {string} The HTML item for the own account or guest account.
 */
function getOwnContactTemplate(contactData) {
  return `<button type="button" class="contact-card" id="contact-${contactData.id}" onclick="showContactDetails('${contactData.id}')">
            <div class="shortcut-wrapper">
              <span class="contact-shortcut">${contactData.shortcut}</span>
              <span class="own-account-badge-on-shortcut">My Account</span>
            </div>
            <div class="contact-data-container">
              <span class="contact-name">${contactData.name}</span>
              <span class="contact-e-mail">${contactData.email}</span>
            </div>
          </button>`;
}


/**
 * Creates the HTML structure for the contact details view.
 * @param {Object} contactData - Object with contact data.
 * @returns {string} The HTML item for the contact details view.
 */
function getContactDetailsTemplate(contactData) {
  return `<div class="contact-details-header-container">
        <div class="contact-details-title-container">
          <span class="contact-details-title">Contacts</span>
          <span class="contact-details-subtitle">Better with a team</span>
        </div>
        <button type="button" class="back-button" onclick="backToContactList()">
        <img src="../assets/icons/login-back-vector.svg" alt="Back button icon">
        </button>
      </div>

      <!-- Contact details main -->
      <div class="contact-details-name-container">
        <span class="contact-details-shortcut" id="contact-details-shortcut-${contactData.id}">${contactData.shortcut}</span>
        <div>
          <span class="contact-details-name">${contactData.name}</span>
            <div class="contact-option-menu-container-desktop hidden">
              <button type="button" class="option-button" onclick="editContactDetails()">
                <img src="../assets/icons/contacts/edit_icon.png" alt="Edit icon" />
                <span>Edit</span>
              </button>
              <button type="button" class="option-button" onclick="openDialogDeleteQuestion()">
                <img src="../assets/icons/contacts/delete_icon.png" alt="Delete icon" />
                <span>Delete</span>
              </button>
            </div>
        </div>
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
      <button class="button-basic button-primary contact-menu" id="edit-contact-menu-button" onclick="toggleMobileContactOptions()" aria-expanded="false" aria-controls="contact-options" aria-label="Open contact details option menu">
        <img src="../assets/icons/contacts/contact_options_icon.png" alt="Contact options button mobile">
      </button>`;
}


/**
 * Creates the HTML structure for the letter category in the contact list.
 * @param {string} letter - The first letter from the last name of the contact.
 * @returns {string} The HTML item for the letter category.
 */
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


/**
 * Creates the HTML structure for the placeholder of the contact details view.
 * @returns {string} The HTML item for the placeholder.
 */
function getContactDetailsPlaceholderTemplate() {
  return `<div class="contact-details-header-container">
        <div class="contact-details-title-container">
          <span class="contact-details-title">Contacts</span>
          <span class="contact-details-subtitle">Better with a team</span>
        </div>`;
}
