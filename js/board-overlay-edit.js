/**
 * JavaScript file for editing a task in the overlay of the board page.
 * Uses the task form of the add task page.
 */

// #region OPEN

/**
 * Switches the overlay from the detail view to the edit view and fills the form with the task data.
 * The "Ok" button stays disabled until the form is completely filled.
 * @param {string} taskID - The ID of the task to edit.
 * @returns {Promise<void>} Resolves once filling the form is finished or stopped.
 */
async function openEditView(taskID) {
  const dialogRef = document.getElementById("dialogDetailedTask");
  dialogRef.dataset.dialogMode = "editTask";
  renderOverlayEditView(taskID);
  setMinimumTaskDate();

  const submitButtonRef = document.getElementById("submitEdit");
  submitButtonRef.disabled = true;
  const isFilled = await fillEditForm(taskID, dialogRef);
  if (isFilled) submitButtonRef.disabled = false;
}


/**
 * Renders main part and footer of the edit view. The overlay frame of this task has to be rendered already.
 * @param {string} taskID - The ID of the task to show.
 * @returns {void} Nothing; main part and footer of the overlay are replaced.
 */
function renderOverlayEditView(taskID) {
  const overlayMainRef = document.getElementById(`overlayMain${taskID}`);
  const overlayFooterRef = document.getElementById(`overlayFooter${taskID}`);
  overlayMainRef.innerHTML = templateOverlayMainEdit(taskID);
  // overlayFooterRef.innerHTML = getTaskOverlayActionsTemplate("edit");
  overlayFooterRef.innerHTML = templateOverlayFooterEdit();
}


/**
 * Fills the edit form with the data of a task, including assignees and subtasks.
 * Assignees and subtasks are skipped if the edit mode was left while the assignees were loading.
 * @param {string} taskID - The ID of the task.
 * @param {HTMLDialogElement} dialogRef - The overlay dialog; its data-dialog-mode is checked.
 * @returns {Promise<boolean>} True if the form was filled completely, false if filling was stopped or failed.
 */
async function fillEditForm(taskID, dialogRef) {
  const task = allTasks[taskID];
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description ?? "";
  if (isDateValid(task.dueDate)) document.getElementById("due-date").value = task.dueDate;
  try {
    await initTaskForm(task.assignedTo, task.assignedUserBadges);
    if (dialogRef.dataset.dialogMode !== "editTask") return false;
    setDraftSubtasks(task.subtasks);
    return true;
  } catch (error) {
    return handleEditFormError(error, dialogRef);
  } 
}


/**
 * Handles an error while filling the edit form. Ignores the error if the edit mode was already left,
 * otherwise logs it and opens the connection error dialog.
 * @param {Error} error - The caught error.
 * @param {HTMLDialogElement} dialogRef - The overlay dialog.
 * @returns {boolean} Always false, meaning the form was not filled completely.
 */
function handleEditFormError(error, dialogRef) {
  if (dialogRef.dataset.dialogMode !== "editTask") return false;

  console.error(error);
  openDialogConnectionErrorDatabase();
  return false;
}

// #endregion

// #region SUBMIT

/**
 * Handles the submit of the edit form and saves the changes if possible.
 * The submit button is disabled while this runs.
 * @param {SubmitEvent} event - The submit event of the edit form.
 * @param {string} taskID - The ID of the edited task.
 * @returns {Promise<void>} Resolves once the saving is finished or stopped.
 */
async function handleEditSubmit(event, taskID) {
  event.preventDefault();
  const buttonRef = event.submitter;
  buttonRef.disabled = true;
  try {
    const fields = pickEditableFields(buildTask(document.getElementById("task-form")));
    if (await ensureUpdatePossible(taskID, fields)) {
      await saveEditedTask(taskID, fields);
    }
  } finally {
    buttonRef.disabled = false;
  }
}


/**
 * Prepares saving an edited task: checks the required fields, waits for pending saves and reloads the tasks.
 * If reloading fails, handles it like a close request for the overlay. If the task no longer exists,
 * removes it from the board and closes the overlay.
 * @param {string} taskID - The ID of the edited task.
 * @param {{title: string, dueDate: string}} fields - The edited fields; title and due date must not be empty.
 * @returns {Promise<boolean>} True if the task can be saved, otherwise false.
 */
async function ensureUpdatePossible(taskID, fields) {
  if (!fields.title || !fields.dueDate) return false;
  await patchQueue;
  if (!(await fetchAllTasks())) {
    handleOverlayCloseRequest("dialogDetailedTask");
    return false;
  }
  if (!allTasks[taskID]) {
    updateBoardAfterDelete(taskID);
    return false;
  }
  return true;
}

// #endregion

// #region UPDATE DATA

/**
 * Picks the fields that can be changed in the edit view. Status, position and category are left out.
 * @param {Object} task - The task built from the form.
 * @returns {Object} The title, description, due date, priority, assignees, user badges and subtasks.
 */
function pickEditableFields(task) {
  const { title, description, dueDate, priority, assignedTo, assignedUserBadges, subtasks } = task;
  return { title, description, dueDate, priority, assignedTo, assignedUserBadges, subtasks };
}


/**
 * Builds the path-based updates for the edited fields, so that other fields of the task are not overwritten.
 * @param {string} taskID - The ID of the edited task.
 * @param {Object<string, *>} fields - The edited fields, keyed by field name.
 * @returns {Object<string, *>} The updates, keyed by path ("<taskID>/<field>").
 */
function buildEditUpdates(taskID, fields) {
  const updates = {};
  for (const [field, value] of Object.entries(fields)) {
    updates[`${taskID}/${field}`] = value;
  }
  return updates;
}

// #endregion

// #region SAVE

/**
 * Saves the edited fields. If saving succeeds, shows the updated task and a toast message.
 * @param {string} taskID - The ID of the edited task.
 * @param {Object<string, *>} fields - The edited fields, keyed by field name.
 * @returns {Promise<void>} Resolves once the saving is finished.
 */
async function saveEditedTask(taskID, fields) {
  const saved = await patchTasks(buildEditUpdates(taskID, fields));
  if (saved) {
    adjustTaskUpdate(taskID, fields);
    showToastMessage("Task successfully edited", "toast-message-edit");
  }
}


/**
 * Applies saved changes to allTasks, updates the task card and returns to the detail view.
 * Expects the edit form to still be in the DOM.
 * @param {string} taskID - The ID of the edited task.
 * @param {Object<string, *>} fields - The saved fields, keyed by field name.
 * @returns {void} Nothing; allTasks, the task card and the overlay are updated.
 */
function adjustTaskUpdate(taskID, fields) {
  Object.assign(allTasks[taskID], fields);
  document.getElementById(`taskDetails${taskID}`).innerHTML = templateTaskCardDetails(taskID);
  renderTaskCardDetails(taskID);  
  resetSubtasks();
  renderOverlayDetailView(taskID);
  document.getElementById("dialogDetailedTask").dataset.dialogMode = "detailedTask";
}

// #endregion
