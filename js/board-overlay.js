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
  dialogRef.classList.add("dialog-task-open");
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
  dialogRef.classList.remove("dialog-task-open");
  dialogRef.addEventListener("transitionend", finishClosingOverlay)
}


function finishClosingOverlay(event) {
  if (event.target !== event.currentTarget) closeTaskOverlay();
  event.currentTarget.close();
  event.currentTarget.removeEventListener("transitionend", finishClosingOverlay);
}
// #endregion


// #region RENDER
function renderTaskOverlay(taskID) {
  const overlayRef = document.getElementById("overlayTaskEdit");
  overlayRef.innerHTML = templateOverlayDetailedTask(taskID, getCategoryColor(taskID));
  renderDescription(taskID, `overlayDescription${taskID}`);
  renderPriority(taskID);
  renderOverlayAssignees(taskID);
  renderSubtasks(taskID);
}


function getTaskDate(taskID) {
  const date = allTasks[taskID].dueDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return "No due date";
  return date.split("-").reverse().join(".");
}


function renderPriority(taskID) {
  const priorityRef = document.getElementById(`overlayPriority${taskID}`);
  let priority = allTasks[taskID].priority;
  if (!priority) {
    priority = "medium";
  }
  const priorityString = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  priorityRef.innerHTML = templateOverlayPriority(priorityString, priority);
}


function renderOverlayAssignees(taskID) {
  const assignees = checkForTaskAssignees(taskID);
  if (assignees) {
    const assigneesRef = document.getElementById(`overlayAssigneesContainer${taskID}`);
    assigneesRef.innerHTML = templateOverlayAssignees(taskID);
    renderTaskAssignees(taskID, assignees, "overlay");
  }
}


function renderOneOverlayAssignee(taskID, assignee) {
  const assigneesRef = document.getElementById(`overlayAssignees${taskID}`)
  const name = assignee.name || assignee.shortcut;
  assigneesRef.innerHTML += templateOverlayOneAssignee(assignee.shortcutColor, assignee.shortcut, name);
}


function renderSubtasks(taskID) {
  const subtasks = allTasks[taskID].subtasks;
  if (!hasTaskSubtasks(subtasks)) return;

  const subtasksContainerRef = document.getElementById(`overlaySubtasksContainer${taskID}`);
  subtasksContainerRef.innerHTML = templateOverlaySubtasks(taskID);

  const subtasksListRef = document.getElementById(`overlaySubtasks${taskID}`);
  let subtasksHTML = "";
  for (let indexSubtask = 0; indexSubtask < subtasks.length; indexSubtask++) {
    subtasksHTML += templateOverlayOneSubtask(taskID, indexSubtask);
  } 
  subtasksListRef.innerHTML = subtasksHTML;
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
  if (!(await refreshTasks())) return;

  const deleted = !allTasks[taskID] || await patchTasks(buildDeleteUpdates(taskID));
  if (deleted) updateBoardAfterDelete(taskID);
}


function refreshTasks() {
  return fetchAllTasks();
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
  checkForEmptyColumn()
}
// #endregion