async function init() {
  renderAddTask();
  await initHeader();

  const contacts = await loadAssignedContacts();
  renderAssignedContacts(contacts);
}

function renderAddTask() {
  const content = document.getElementById("add-task-content");
  content.innerHTML = getAddTaskTemplate();
}

function renderAssignedContacts(contacts) {
  const contactList = document.getElementById("contact_list");
  contactList.replaceChildren();

  for (const contact of contacts) {
    const row = document.createElement("li");
    row.innerHTML = getAssignedContactTemplate();

    row.querySelector(".assigned-contact-name").textContent = contact.name;

    const badge = row.querySelector(".selected-contact-badge");
    badge.textContent = contact.shortcut;
    badge.style.backgroundColor = contact.shortcutColor;

    const checkbox = row.querySelector("input");
    checkbox.value = contact.id;
    checkbox.dataset.shortcut = contact.shortcut;
    checkbox.dataset.shortcutColor = contact.shortcutColor;

    contactList.append(row);
  }
}

function toggleAssignedContacts() {
  const contactList = document.getElementById("contact_list");
  const assignedToInput = document.getElementById("assigned-to");

  contactList.hidden = !contactList.hidden;
  assignedToInput.setAttribute("aria-expanded", String(!contactList.hidden));
}

async function loadAssignedContacts() {
  const idToken = await window.auth.currentUser.getIdToken();
  const url =
    "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  const response = await fetch(`${url}?auth=${encodeURIComponent(idToken)}`);

  if (!response.ok) {
    throw new Error(
      `Kontakte konnten nicht geladen werden (${response.status}).`,
    );
  }

  const data = await response.json();
  const contacts = [];

  for (const [id, contact] of Object.entries(data ?? {})) {
    contacts.push({ ...contact, id });
  }
  return contacts;
}

function renderSelectedContactBadges() {
  const badges = document.getElementById("selected-contact-badges");
  const checkedContacts = document.querySelectorAll(
    `#contact_list input[type="checkbox"]:checked`,
  );

  badges.replaceChildren();

  for (const checkbox of checkedContacts) {
    const badge = document.createElement("span");
    badge.className = "selected-contact-badge";
    badge.textContent = checkbox.dataset.shortcut;
    badge.style.backgroundColor = checkbox.dataset.shortcutColor;

    badges.append(badge);
  }
}

const draftSubtasks = [];
let editingSubtask = null;

function updateSubtaskActions() {
  const input = document.getElementById("subtask");
  const actions = document.getElementById("subtask-actions");

  actions.hidden = input.value.trim() === "";
}

function clearSubtaskInput() {
  document.getElementById("subtask").value = "";
  editingSubtask = null;
  updateSubtaskActions();
}

function handleSubtaskKeydown(event) {
  if (event.key === "Enter" && !event.isComosing) {
    event.preventDefault();
    saveSubtask();
  }
}

function saveSubtask() {
  const input = document.getElementById("subtask");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  draftSubtasks.push({ text });
  clearSubtaskInput();
  renderSubtasks();
  input.focus();
}

function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  list.replaceChildren();

  for (let i = 0; i < draftSubtasks.length; i++) {
    const subtask = draftSubtasks[i];
    const isEditing = editingSubtask?.subtask === subtask;
    const row = document.createElement("li");
    row.innerHTML = getSubtaskTemplate(i, isEditing);

    if (isEditing) {
      row.querySelector(".subtask-edit-input").value = editingSubtask.text;
    } else {
      row.querySelector(".subtask-text").textContent = subtask.text;
    }
    list.append(row);
  }
}

function editSubtask(index) {
  const subtask = draftSubtasks[index];
  editingSubtask = { subtask, text: subtask.text };

  renderSubtasks();
  document.querySelector(".subtask-edit-input").focus();
}

function saveSubtaskEdit() {
  const text = editingSubtask.text.trim();
  if (text === "") return;

  editingSubtask.subtask.text = text;
  editingSubtask = null;
  renderSubtasks();
}

function handleSubtaskEditKeydown(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    saveSubtaskEdit();
  }

  if (event.key === "Escape") {
    editingSubtask = null;
    renderSubtasks();
  }
}

function deleteSubtask(i) {
  if (editingSubtask === draftSubtasks[i]) {
    clearSubtaskInput();
  }

  draftSubtasks.splice(i, 1);
  renderSubtasks();
}

function resetSubtasks() {
  draftSubtasks.length = 0;
  clearSubtaskInput();
  renderSubtasks();
}

init();
