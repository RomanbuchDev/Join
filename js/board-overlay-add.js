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
  const dialogRef = document.getElementById("dialogAddTask");
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-board-open");

  const overlayRef = document.getElementById("overlayAddTask");
  overlayRef.innerHTML = getAddTaskTemplate();
  setMinimumTaskDate();
  setAddTaskFormStatus(status);
}

// #endregion
