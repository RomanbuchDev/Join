/**
 * Switches the overlay from the detail view to the edit view.
 * @param {string} taskID - The ID of the task to edit.
 * @returns {void} Nothing; main part and footer of the overlay are replaced by the edit view.
 */
async function editTask(taskID) {
  const dialogRef = document.getElementById("dialogTask");
  dialogRef.dataset.dialogMode = "editTask";
  const overlayMainRef = document.getElementById(`overlayMain${taskID}`);
  const overlayFooterRef = document.getElementById(`overlayFooter${taskID}`);
  overlayMainRef.innerHTML = templateOverlayMainEdit(taskID);
  overlayFooterRef.innerHTML = templateOverlayFooterEdit(taskID);

  const submitButtonRef = document.getElementById("submitEdit");
  submitButtonRef.disabled = true;
  const isFilled = await fillInTaskData(taskID, dialogRef);
  if (isFilled) submitButtonRef.disabled = false;
}


async function fillInTaskData (taskID, dialogRef) {
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
    return handleFillError(error, dialogRef);
  } 
}


function handleFillError(error, dialogRef) {
  if (dialogRef.dataset.dialogMode !== "editTask") return false;

  console.error(error);
  openDialogConnectionErrorDatabase();
  return false;
}


async function updateTask(event, taskID) {
  event.preventDefault();
  const buttonRef = event.submitter;
  buttonRef.disabled = true;
  try {
    await runEditUpdate(taskID);
  } finally {
    buttonRef.disabled = false;
  }
}


async function runEditUpdate(taskID) {
  const fields = buildEditFields(buildTask(document.getElementById("task-form")));
  if (!fields.title || !fields.dueDate) return;
  await patchQueue;
  if (!(await fetchAllTasks())) {
    checkForDialogMode();
    return;
  }
  if (!allTasks[taskID]) {
    updateBoardAfterDelete(taskID);
    return;
  }
  const saved = await patchTasks(buildEditUpdates(taskID, fields));
  if (saved) showUpdatedTask(taskID, fields);
}


function buildEditFields(task) {
  const { title, description, dueDate, priority, assignedTo, assignedUserBadges, subtasks } = task;
  return { title, description, dueDate, priority, assignedTo, assignedUserBadges, subtasks };
}


function buildEditUpdates(taskID, fields) {
  const updates = {};
  for (const [field, value] of Object.entries(fields)) {
    updates[`${taskID}/${field}`] = value;
  }
  return updates;
}


function showUpdatedTask(taskID, fields) {
  Object.assign(allTasks[taskID], fields);
  document.getElementById(`taskDetails${taskID}`).innerHTML 
    = templateTaskDetails(taskID);
  renderTaskDetails(taskID);  
  resetSubtasks();
  renderOverlayTaskDetailContent(taskID);
  document.getElementById("dialogTask").dataset.dialogMode 
    = "detailedTask";
}
