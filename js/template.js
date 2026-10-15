// Templates - Contacts page

function getContactTemplate(contactData) {
  return `<button type="button" class="contact-card" id="contact-${contactData.id}" onclick="showContactDetails('${contactData.id}')">
            <span class="contact-shortcut">${contactData.shortcut}</span>
            <div class="contact-data-container">
              <span class="contact-name">${contactData.name}</span>
              <span class="contact-e-mail">${contactData.email}</span>
            </div>
          </button>`;
}


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
      <button class="button-basic button-primary contact-menu" id="contact-menu-button" onclick="toggleMobileContactOptions()">
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


function getContactDetailsPlaceholderTemplate() {
  return `<div class="contact-details-header-container">
        <div class="contact-details-title-container">
          <span class="contact-details-title">Contacts</span>
          <span class="contact-details-subtitle">Better with a team</span>
        </div>`;
}


function templateHeader(avatarShortcut) {
  return `
    <a class="main-header-logo" href="./summary.html"
          ><img src="../assets/icons/join-logo.svg" alt="Join Logo"
        /></a>
        <p class="main-header-title">Kanban Project Management Tool</p>
        <a
          href="./help.html"
          class="main-header-help"
          aria-label="Link to Help page"
        >
          <img src="../assets/icons/help.svg" alt="" />
        </a>
        <div class="user-menu">
          <button
            type="button"
            class="user-avatar"
            onclick="toggleUserMenu(this)"
            aria-expanded="false"
            aria-controls="user-menu-dropdown"
            aria-label="Open user menu"
          >${avatarShortcut}
          </button>

          <ul id="user-menu-dropdown" class="user-menu-dropdown">
            <li class="user-menu-item user-menu-item--help">
              <a href="./help.html">Help</a>
            </li>
            <li class="user-menu-item">
              <a href="./imprint.html">Legal Notice</a>
            </li>
            <li class="user-menu-item">
              <a href="./privacy-policy.html">Privacy Policy</a>
            </li>
            <li class="user-menu-item user-menu-item--logout">
              <button type="button" class="user-menu-logout">Log out</button>
            </li>
          </ul>
        </div>
    `
}