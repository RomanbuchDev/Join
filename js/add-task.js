async function initAddTask() {
  renderAddTask();
  const status = new URLSearchParams(window.location.search).get("status");
  setAddTaskFormStatus(status);
  await initHeader();
  await initTaskForm();
}


function setAddTaskFormStatus(
  status,
  form = document.getElementById("task-form"),
) {
  form.dataset.status = getValidAddTaskStatus(status);
}


async function initTaskForm(assignedIds = [], assignedUserBadges = {}) {
  const contacts = await loadAssignedContacts();
  await addSelfAssignee(contacts);
  addSavedUserAssignees(contacts, assignedIds, assignedUserBadges);
  renderAssignedContacts(contacts);
  setAssignedContacts(assignedIds);
}


function addSavedUserAssignees(contacts, assignedIds = [], badges = {}) {
  for (const id of assignedIds) {
    addSavedUserAssignee(contacts, id, badges);
  }
}


function addSavedUserAssignee(contacts, id, badges) {
  if (contacts.some((contact) => contact.id === id)) return;

  const badge = badges[id];
  if (!badge) return;

  contacts.push(createSavedUserAssignee(id, badge));
}


function createSavedUserAssignee(id, badge) {
  return {
    ...badge,
    id,
    source: "users",
    name: badge.name ?? badge.shortcut ?? "User",
  };
}


function setAssignedContacts(assignedIds = []) {
  const checkboxes = document.querySelectorAll(
    '#contact_list input[type="checkbox"]',
  );
  for (const checkbox of checkboxes) {
    checkbox.checked = (assignedIds ?? []).includes(checkbox.value);
  }
  renderSelectedContactBadges();
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
  const isSelf =
    contact.source === "users" && contact.id === window.auth.currentUser?.uid;
  row.querySelector(".assigned-contact-name").textContent =
    contact.name + (isSelf ? " (You)" : "");
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
  checkbox.dataset.name = contact.name;
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
  const baseUrl = window.firebaseUrl.replace(/\/+$/, "");
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
  const initials = name.split(/\s+/).slice(0, 2);
  return {
    id: uid,
    name,
    shortcut: initials
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
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


function createTask(event, onSuccess = resetAddTaskAfterSave) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector(".form-action--create");
  if (button.disabled) return;
  button.disabled = true;
  return submitTaskForm(form, onSuccess).finally(() => {
    button.disabled = false;
  });
}


async function submitTaskForm(form, onSuccess = resetAddTaskAfterSave) {
  try {
    const task = buildTask(form);
    if (!task.title) throw new Error("Bitte gib einen Titel ein.");
    if (!(await saveNewTask(task))) return false;
    await onSuccess(form);
    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}


function resetAddTaskAfterSave(form) {
  form.reset();
}


function buildTask(form, status = form.dataset.status) {
  const data = new FormData(form);
  return {
    ...readTaskFields(form, data),
    status: getValidAddTaskStatus(status),
    assignedTo: data.getAll("assignedTo"),
    assignedUserBadges: getAssignedUserBadges(form),
    subtasks: getDraftSubtasks(),
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
      name: checkbox.dataset.name,
      shortcut: checkbox.dataset.shortcut,
      shortcutColor: checkbox.dataset.shortcutColor,
    };
  }
  return badges;
}


async function saveNewTask(task) {
  await patchQueue;
  if (!(await fetchAllTasks())) return false;
  const previousTasks = structuredClone(allTasks);
  const taskID = crypto.randomUUID();
  const updates = createNewTaskUpdates(taskID, {
    ...task,
    status: getValidAddTaskStatus(task.status),
  });
  return persistNewTaskUpdates(updates, previousTasks);
}


async function persistNewTaskUpdates(updates, previousTasks) {
  const saved = await patchTasks(updates);
  if (!saved) replaceAllTasks(previousTasks);
  return saved;
}


function getValidAddTaskStatus(status) {
  const statuses = ["toDo", "inProgress", "awaitFeedback", "done"];
  return statuses.includes(status) ? status : "toDo";
}


function createNewTaskUpdates(taskID, task) {
  const updates = {};
  allTasks[taskID] = { ...task, position: 0 };
  insertTaskIntoColumn(updates, task.status, {
    insertedTaskID: taskID,
    previousTaskID: null,
  });
  delete updates[`${taskID}/position`];
  updates[taskID] = structuredClone(allTasks[taskID]);
  return updates;
}
