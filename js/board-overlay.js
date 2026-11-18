/**
 * JavaScript file for the board overlay.
 */

// #region SHOW

function handleTaskCardClick(event, taskID) {
  if (event.target.closest(".move-menu-container")) return;

  openTaskOverlay(taskID);
}


function openTaskOverlay(taskID) {
  const dialogRef = document.getElementById("dialogTask");
  renderTaskOverlay(taskID);
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-board-open");
}

// #endregion

// #region CLOSE

function handleOverlayBackdropClick(event) {
  if (event.target === event.currentTarget) closeTaskOverlay();
}


function handleOverlayCancel(event) {
  event.preventDefault();
  closeTaskOverlay();
}


function closeTaskOverlay() {
  const dialogRef = document.getElementById("dialogTask");
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.addEventListener("transitionend", finishClosingOverlay);
}


function finishClosingOverlay(event) {
  const openedDialog = event.currentTarget;
  if (event.target !== openedDialog) return;

  openedDialog.close();
  openedDialog.removeEventListener("transitionend", finishClosingOverlay);
}

// #endregion

// #region RENDER

function renderTaskOverlay(taskID) {
  const overlayRef = document.getElementById("overlayTaskEdit");
  overlayRef.innerHTML = templateOverlayTask(taskID, getCategoryColor(taskID));
  const overlayMainRef = document.getElementById(`overlayMain${taskID}`);
  const overlayFooterRef = document.getElementById(`overlayFooter${taskID}`);
  overlayMainRef.innerHTML = templateOverlayMainDetails(taskID);
  overlayFooterRef.innerHTML = templateOverlayFooterDetails(taskID);
  renderDescription(taskID, `overlayDescription${taskID}`);
  renderPriority(taskID);
  renderOverlayAssignees(taskID);
  renderOverlaySubtasks(taskID);
}


function getTaskDate(taskID) {
  const date = allTasks[taskID].dueDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return "No due date";
  return date.split("-").reverse().join(".");
}


function renderPriority(taskID) {
  const priorityRef = document.getElementById(`overlayPriority${taskID}`);
  const priority = allTasks[taskID].priority || "medium";
  const priorityString = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  priorityRef.innerHTML = templateOverlayPriority(priorityString, priority);
}


function renderOverlayAssignees(taskID) {
  const assigneesRef = document.getElementById(`overlayAssigneesContainer${taskID}`);
  const assignees = allTasks[taskID].assignedTo;
  if (!hasTaskAssignees(assignees)) {
    assigneesRef.classList.add("d-none");
    return;
  }

  assigneesRef.innerHTML = templateOverlayAssignees(taskID);
  renderTaskAssignees(taskID, assignees, "overlay");
}


function renderOneOverlayAssignee(taskID, assignee) {
  const assigneesRef = document.getElementById(`overlayAssignees${taskID}`);
  const name = assignee.name || assignee.shortcut;
  assigneesRef.innerHTML += templateOverlayOneAssignee(assignee.shortcutColor, assignee.shortcut, name);
}


function renderOverlaySubtasks(taskID) {
  const subtasksContainerRef = document.getElementById(`overlaySubtasksContainer${taskID}`);
  const subtasks = allTasks[taskID].subtasks;
  if (!hasTaskSubtasks(subtasks)) {
    subtasksContainerRef.classList.add("d-none");
    return;
  }

  subtasksContainerRef.innerHTML = templateOverlaySubtasks(taskID);
  const subtasksListRef = document.getElementById(`overlaySubtasks${taskID}`);
  subtasksListRef.innerHTML = getSubtasksHtml(taskID, subtasks);
}


function getSubtasksHtml(taskID, subtasks) {
  let subtasksHTML = "";
  for (let indexSubtask = 0; indexSubtask < subtasks.length; indexSubtask++) {
    subtasksHTML += templateOverlayOneSubtask(taskID, indexSubtask);
  }
  return subtasksHTML;
}

// #endregion

// #region EDIT

async function toggleSubtask(event, taskID, indexSubtask) {
  const checkboxRef = event.currentTarget;
  const newValue = checkboxRef.checked;
  const subtask = allTasks[taskID].subtasks[indexSubtask];
  checkboxRef.disabled = true;
  try {
    const saved = await patchTasks({[`${taskID}/subtasks/${indexSubtask}/done`]: newValue});
    if (saved) {
      adjustSubtaskChange(taskID, subtask, newValue);
    }
  } finally {
    checkboxRef.disabled = false;
  }
}


function adjustSubtaskChange(taskID, subtask, newValue) {
  subtask.done = newValue;
  renderProgressBar(taskID);
}


function editTask(taskID) {
  const overlayMainRef = document.getElementById(`overlayMain${taskID}`);
  const overlayFooterRef = document.getElementById(`overlayFooter${taskID}`);
  overlayMainRef.innerHTML = templateOverlayMainEdit(taskID);
  overlayFooterRef.innerHTML = templateOverlayFooterEdit(taskID);
}

// #endregion

// #region DELETE

async function deleteTask(event, taskID) {
  const buttonRef = event.currentTarget;
  buttonRef.disabled = true;
  try {
    await runDeletion(taskID);
  } finally {
    buttonRef.disabled = false;
  }
}


async function runDeletion(taskID) {
  await patchQueue;
  if (!(await fetchAllTasks())) return;

  const deleted = !allTasks[taskID] || await patchTasks(buildDeleteUpdates(taskID));
  if (deleted) updateBoardAfterDelete(taskID);
}


function buildDeleteUpdates(taskID) {
  const updates = {};
  removeTaskFromColumn(updates, allTasks[taskID].status, taskID);
  updates[taskID] = null;
  return updates;
}


function updateBoardAfterDelete(taskID) {
  const cardRef = document.querySelector(`[data-task-id="${taskID}"]`);
  const columnRef = cardRef?.parentElement;
  delete allTasks[taskID];
  cardRef?.remove();
  closeTaskOverlay();
  if (columnRef) renderAmountOfTasks(columnRef.id, columnRef.children.length);
  checkForEmptyColumn();
}

// #endregion
