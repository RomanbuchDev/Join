async function init() {
  renderAddTask();
  await initHeader();

  const contacts = await loadAssignedContacts();
  await addSelfAssignee(contacts);
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
    contactList.append(createAssignedContactRow(contact));
  }
}


function createAssignedContactRow(contact) {
  const row = document.createElement("li");
  row.innerHTML = getAssignedContactTemplate();
  row.querySelector(".assigned-contact-name").textContent = contact.name;

  setContactBadge(row, contact);
  setContactCheckbox(row, contact);
  return row;
}


function setContactBadge(row, contact) {
  const badge = row.querySelector(".selected-contact-badge");
  badge.textContent = contact.shortcut;
  badge.style.backgroundColor = contact.shortcutColor;
}


function setContactCheckbox(row, contact) {
  const checkbox = row.querySelector("input");
  checkbox.value = contact.id;
  checkbox.dataset.source = contact.source ?? "contacts";
  checkbox.dataset.shortcut = contact.shortcut;
  checkbox.dataset.shortcutColor = contact.shortcutColor;
}


function toggleAssignedContacts() {
  const contactList = document.getElementById("contact_list");
  const assignedToInput = document.getElementById("assigned-to");

  contactList.hidden = !contactList.hidden;
  assignedToInput.setAttribute("aria-expanded", String(!contactList.hidden));
}


async function loadAssignedContacts() {
  const idToken = await window.auth.currentUser.getIdToken();
  const response = await fetch(getDatabaseUrl("contacts", idToken));

  checkContactsResponse(response);

  const data = await response.json();
  return Object.entries(data ?? {}).map(([id, contact]) => ({
    ...contact,
    id,
  }));
}


function getDatabaseUrl(path, idToken) {
  const baseUrl =
    "https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app";

  return `${baseUrl}/${path}.json?auth=${encodeURIComponent(idToken)}`;
}


function checkContactsResponse(response) {
  if (response.ok) return;

  throw new Error(
    `Kontakte konnten nicht geladen werden (${response.status}).`,
  );
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
    list.append(createSubtaskRow(draftSubtasks[i], i));
  }
}


function createSubtaskRow(subtask, index) {
  const isEditing = editingSubtask?.subtask === subtask;
  const row = document.createElement("li");
  row.innerHTML = getSubtaskTemplate(index, isEditing);

  updateSubtaskRowContent(row, subtask, isEditing);
  return row;
}


function updateSubtaskRowContent(row, subtask, isEditing) {
  if (isEditing) {
    row.querySelector(".subtask-edit-input").value = editingSubtask.text;
    return;
  }

  row.querySelector(".subtask-text").textContent = subtask.text;
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


async function addSelfAssignee(contacts) {
  const user = window.auth.currentUser;
  if (!isAssignableUser(user)) return;

  await tryAddSelfAssignee(contacts, user);
}


function isAssignableUser(user) {
  return user && !user.isAnonymous;
}


async function tryAddSelfAssignee(contacts, user) {
  try {
    const profile = await loadUserProfile(user);
    addSelfAssigneeFromProfile(contacts, user, profile);
  } catch (error) {
    console.warn("Eigenes Profil konnte nicht geladen werden", error);
  }
}


function addSelfAssigneeFromProfile(contacts, user, profile) {
  const name = profile?.name?.trim();
  if (!name) return;

  contacts.unshift(createSelfAssignee(user.uid, name));
}


async function loadUserProfile(user) {
  const idToken = await user.getIdToken();
  const path = `users/${encodeURIComponent(user.uid)}`;
  const response = await fetch(getDatabaseUrl(path, idToken));

  if (!response.ok) {
    throw new Error(`Profil konnte nicht geladen werden (${response.status}).`);
  }

  return response.json();
}


function createSelfAssignee(uid, name) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]);

  return {
    id: uid,
    name: `${name} (You)`,
    shortcut: initials.join("").toUpperCase(),
    shortcutColor: "#29abe2",
    source: "users",
  };
}


function closeAssignedContactsOnOutsideClick(event) {
  const contactList = document.getElementById("contact_list");
  if (!contactList || contactList.hidden) return;
  if (event.target.closest(".form-field--assigned")) return;

  toggleAssignedContacts();
}


function clearTaskForm() {
  resetSubtasks();
  document.getElementById("selected-contact-badges").replaceChildren();

  const contactList = document.getElementById("contact_list");
  if (!contactList.hidden) {
    toggleAssignedContacts();
  }
}


function createTask(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector(".form-action--create");
  if (button.disabled) return;
  button.disabled = true;
  return submitTaskForm(form).finally(() => {
    button.disabled = false;
  });
}


async function submitTaskForm(form) {
  try {
    const task = buildTask(form);
    if (!task.title) throw new Error("Bitte gib einen Titel ein.");
    await saveNewTask(task);
    form.reset();
  } catch (error) {
    alert(error.message);
  }
}


function buildTask(form) {
  const data = new FormData(form);
  return {
    ...readTaskFields(form, data),
    status: "toDo",
    position: Date.now(),
    assignedTo: data.getAll("assignedTo"),
    assignedUserBadges: getAssignedUserBadges(form),
    subtasks: draftSubtasks.map(({ text }) => ({ text, done: false })),
  };
}


function readTaskFields(form, data) {
  return {
    title: data.get("title").trim(),
    description: data.get("description").trim(),
    dueDate: data.get("due-date"),
    priority: data.get("priority"),
    category: form.elements.category.selectedOptions[0].textContent.trim(),
  };
}


function getAssignedUserBadges(form) {
  const badges = {};
  const checked = form.querySelectorAll("#contact_list input:checked");
  for (const checkbox of checked) {
    if (checkbox.dataset.source !== "users") continue;
    badges[checkbox.value] = {
      shortcut: checkbox.dataset.shortcut,
      shortcutColor: checkbox.dataset.shortcutColor,
    };
  }
  return badges;
}


async function saveNewTask(task) {
  const user = window.auth.currentUser;
  if (!user) throw new Error("Bitte melde dich an.");
  const idToken = await user.getIdToken();
  const response = await fetch(getDatabaseUrl("tasks", idToken), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error(`Firebase-Fehler ${response.status}.`);
}

init();
