/**
 * Renders the Add Task page, sets the task status,
 * waits for the current user, and initializes the task form.
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
async function initAddTask() {
  renderAddTask();
  setMinimumTaskDate();
  const status = new URLSearchParams(window.location.search).get("status");
  setAddTaskFormStatus(status);
  await window.getCurrentUser();
  await initTaskForm();
  document.body.classList.remove("is-loading");
}


/**
 * Renders the Add Task page content into its container.
 * @returns {void}
 */
function renderAddTask() {
  const content = document.getElementById("add-task-content");
  content.innerHTML = getAddTaskTemplate();
}


/**
 * Sets the form's task status, falling back to "toDo" for invalid values.
 * @param {string|null} status - The requested task status.
 * @param {HTMLFormElement} [form=document.getElementById("task-form")] - The task form.
 * @returns {void}
 */
function setAddTaskFormStatus(
  status,
  form = document.getElementById("task-form"),
) {
  form.dataset.status = getValidAddTaskStatus(status);
}


/**
 * Resets draft subtasks, removes selected assignee badges,
 * and closes the assignee dropdown if it is open.
 * @returns {void}
 */
function clearTaskForm() {
  clearTaskValidation();
  resetSubtasks();
  document.getElementById("selected-contact-badges").replaceChildren();

  const contactList = document.getElementById("contact_list");
  if (!contactList.hidden) {
    toggleAssignedContacts();
  }
}


/**
 * Submits the task form and disables the create button until submission finishes.
 * @param {SubmitEvent} event - The form's submit event.
 * @param {function(HTMLFormElement): (void|Promise<void>)} [onSuccess=resetAddTaskAfterSave] - Callback run after saving.
 * @returns {Promise<boolean>|undefined} The submission result, or undefined if the button is already disabled.
 */
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


/**
 * Validates the task form, builds and saves the task,
 * and executes the success callback.
 * @param {HTMLFormElement} form - The task form containing the task data.
 * @param {function(HTMLFormElement): (void|Promise<void>)} [onSuccess=resetAddTaskAfterSave] - Callback executed after saving.
 * @returns {Promise<boolean>} True if validation, saving, and the callback succeed; otherwise false.
 */
async function submitTaskForm(form, onSuccess = resetAddTaskAfterSave) {
  try {
    if (!validateTaskForm(form)) return false;
    const task = buildTask(form);
    if (!(await saveNewTask(task))) return false;

    await onSuccess(form);
    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}


/**
 * Trims the task title and validates the form.
 * @param {HTMLFormElement} form - The task form to validate.
 * @returns {boolean} True if the form is valid.
 */
function validateTaskForm(form) {
  const titleInput = form.elements.namedItem("title");
  titleInput.value = titleInput.value.trim();

  if (form.checkValidity()) return true;

  form.querySelector(":invalid")?.focus();
  return false;
}


/**
 * Returns to the board when a status URL parameter is present.
 * Otherwise resets the form and displays a confirmation toast.
 * @param {HTMLFormElement} form - The saved task's form.
 * @returns {void}
 */
function resetAddTaskAfterSave(form) {
  const params = new URLSearchParams(window.location.search);

  if (params.has("status")) {
    window.location.assign("board.html");
    return;
  }

  form.reset();
  showToastMessage("Task added to board", "toast-message-new");
}


/**
 * Builds a task object from the form fields, selected assignees, and draft subtasks.
 * @param {HTMLFormElement} form - The form containing the task data.
 * @param {string} [status=form.dataset.status] - The requested task status; invalid values default to "toDo".
 * @returns {Object} The task data prepared for saving.
 */
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


/**
 * Reads task fields, trims the title and description,
 * and includes the category if its form control exists.
 * @param {HTMLFormElement} form - The task form.
 * @param {FormData} data - The data collected from the form.
 * @returns {Object} The task fields read from the form.
 */
function readTaskFields(form, data) {
  return {
    title: data.get("title").trim(),
    description: data.get("description").trim(),
    dueDate: data.get("due-date"),
    priority: data.get("priority"),
    ...readAddTaskCategory(form),
  };
}


/**
 * Reads the selected category's display text if the category field exists.
 * @param {HTMLFormElement} form - The task form to read.
 * @returns {{category?: string}} The selected category, or an empty object if the field is absent.
 */
function readAddTaskCategory(form) {
  const category = form.elements.namedItem("category");
  if (!category) return {};

  return {
    category: category.selectedOptions[0].textContent.trim(),
  };
}


/**
 * Collects names, initials, and badge colors for selected user assignees.
 * @param {HTMLFormElement} form - The task form containing the assignee checkboxes.
 * @returns {Object.<string, Object>} Badge data keyed by user ID.
 */
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


/**
 * Saves a new task at the start of its status column and updates task positions.
 * @param {Object} task - The task data to save.
 * @returns {Promise<boolean>} True if saving succeeds, or false if loading or saving fails.
 */
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


/**
 * Saves task updates and restores the previous local state if saving returns false.
 * @param {Object} updates - The task updates to persist.
 * @param {Object} previousTasks - The task state to restore if saving fails.
 * @returns {Promise<boolean>} Whether the updates were saved successfully.
 */
async function persistNewTaskUpdates(updates, previousTasks) {
  const saved = await patchTasks(updates);
  if (!saved) replaceAllTasks(previousTasks);
  return saved;
}


/**
 * Returns the given task status if valid, otherwise defaults to "toDo".
 * @param {string|null|undefined} status - The task status to validate.
 * @returns {"toDo"|"inProgress"|"awaitFeedback"|"done"} A valid task status.
 */
function getValidAddTaskStatus(status) {
  const statuses = ["toDo", "inProgress", "awaitFeedback", "done"];
  return statuses.includes(status) ? status : "toDo";
}


/**
 * Inserts a task at the start of its status column in local state
 * and builds the updates needed to persist the task and affected positions.
 * @param {string} taskID - The new task's unique ID.
 * @param {Object} task - The task data to insert.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} task.status - The target column.
 * @returns {Object} The updates to persist.
 */
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


/**
 * Shows an inline validation message instead of the browser popup.
 * @param {Event} event - The invalid event from a form control.
 * @returns {void}
 */
function markTaskFieldInvalid(event) {
  event.preventDefault();
  const input = event.target;
  const field = input.closest(".form-field");
  input.classList.add("task-field-invalid");
  field.dataset.error = input.validity.valueMissing
    ? "This field is required"
    : input.validationMessage;
}


/**
 * Removes validation markers when the task form is reset.
 * @returns {void}
 */
function clearTaskValidation() {
  const inputs = document.querySelectorAll("#task-form .task-field-invalid");
  for (const input of inputs) {
    input.classList.remove("task-field-invalid");
  }
}


/**
 * Sets today as the earliest allowed due date.
 * @returns {void}
 */
function setMinimumTaskDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  document.getElementById("due-date").min = `${year}-${month}-${day}`;
}
