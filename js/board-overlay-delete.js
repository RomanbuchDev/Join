/**
 * JavaScript file for deleting a task in the overlay of the board page.
 */

// #region VARIABLES

/** The confirmation dialog for deleting a task. */
const deleteQuestionRef = document.getElementById("delete-question-dialog");

// #endregion

// #region CONFIRM DIALOG

/**
 * Opens the confirmation dialog for deleting a task.
 * @param {string} taskID - The ID of the task to delete.
 * @returns {void} Nothing; the dialog is opened and filled.
 */
function openDialogTaskDeleteQuestion(taskID) {
  deleteQuestionRef.showModal();
  deleteQuestionRef.innerHTML = templateDeleteQuestion(taskID);
}


/**
 * Closes the confirmation dialog for deleting a task.
 * @returns {void} Nothing; the dialog is closed.
 */
function closeDialogDeleteQuestion() {
  deleteQuestionRef.close();
}

// #endregion

// #region DELETE TASK

/**
 * Deletes a task from the database and the board.
 * The clicked button is disabled while the deletion runs. The form of the confirmation dialog
 * closes the dialog right after the click, without waiting for the deletion.
 * @param {MouseEvent} event - The click event on the "YES" button of the confirmation dialog.
 * @param {string} taskID - The ID of the task to delete.
 * @returns {Promise<void>} Resolves once the deletion is finished or failed.
 */
async function deleteTask(event, taskID) {
  const buttonRef = event.currentTarget;
  buttonRef.disabled = true;
  try {
    await runDeletion(taskID);
  } finally {
    buttonRef.disabled = false;
  }
}


/**
 * Waits for pending saves, reloads the tasks and deletes the task if it still exists.
 * If it was deleted successfully or no longer exists, updates the board and shows a toast message.
 * Stops if reloading the tasks fails or if the saving fails.
 * @param {string} taskID - The ID of the task to delete.
 * @returns {Promise<void>} Resolves once the deletion is finished or stopped.
 */
async function runDeletion(taskID) {
  await patchQueue;
  if (!(await fetchAllTasks())) return;

  const deleted = !allTasks[taskID] || await patchTasks(buildDeleteUpdates(taskID));
  if (deleted) {
    updateBoardAfterDelete(taskID);
    closeDialogDeleteQuestion();
    showToastMessage("Task successfully deleted", "toast-message-delete");
  }
}


/**
 * Builds the update object for deleting a task: removes it from the order of its column
 * and sets the task itself to null.
 * @param {string} taskID - The ID of the task to delete.
 * @returns {Object<string, string|number|null>} The path-based updates for the PATCH request.
 */
function buildDeleteUpdates(taskID) {
  const updates = {};
  removeTaskFromColumn(updates, allTasks[taskID].status, taskID);
  updates[taskID] = null;
  return updates;
}

// #endregion

// #region UPDATE BOARD

/**
 * Removes a deleted task from allTasks and the board, closes the overlay
 * and updates the task counter and the empty-column message.
 * @param {string} taskID - The ID of the deleted task.
 * @returns {void} Nothing; allTasks and the DOM are updated.
 */
function updateBoardAfterDelete(taskID) {
  const cardRef = document.querySelector(`[data-task-id="${taskID}"]`);
  const columnRef = cardRef?.parentElement;
  delete allTasks[taskID];
  cardRef?.remove();
  closeTaskOverlay();
  if (columnRef) renderTaskCount(columnRef.id, columnRef.children.length);
  renderEmptyColumnMessages();
}

// #endregion
