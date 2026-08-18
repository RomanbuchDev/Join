// Templates - Contacts page

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
