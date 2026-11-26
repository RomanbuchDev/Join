// #region OPEN

function openAddView(status) {
  if (window.matchMedia("(width < 48em)").matches) {
    openAddTaskPage(status);
  } else {
    openBoardOverlayAddView(status);
  }
}


function openAddTaskPage(status) {
  const addTaskPage = `../html/add-task.html?status=${status}`;
  window.location.href = addTaskPage;
}


function openBoardOverlayAddView(status) {
  const dialogID = "dialogAddTask";
  renderAddView(dialogID, status)

  const dialogRef = document.getElementById(dialogID);
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-board-open");
}


function renderAddView(dialogID, status) {
  const overlayRef = document.getElementById("overlayAddTask");
  overlayRef.innerHTML = templateOverlayAddFrame(dialogID);
  setMinimumTaskDate();
  initTaskForm();
  resetSubtasks();
  setAddTaskFormStatus(status);
}


function finishAddSubmit(form) {
  renderAddedTask(form);
  closeOverlay("dialogAddTask");
  showToastMessage("Task added to board", "toast-message-new");
}


function renderAddedTask(form) {
  console.log(form)
  const status = form.dataset.status;
  const addedTaskID = getSortedTaskIds(status)[0];
  const destinationColumn = document.getElementById(status);
  destinationColumn.querySelector(".empty-column-message")?.remove();
  destinationColumn.insertAdjacentHTML("afterbegin", templateTaskCard(addedTaskID, getCategoryColorClass(addedTaskID)));
  renderTaskCardDetails(addedTaskID);
  renderTaskCount(status, destinationColumn.children.length);
}

// #endregion
