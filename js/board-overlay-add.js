// #region OPEN

function openAddView(status) {
  if (window.matchMedia("(width >= 48em)").matches) {
    openBoardOverlayAddView(status);
  } else {
    openAddTaskPage(status);
  }
}


function openBoardOverlayAddView(status) {
  console.log(status);
  
}


function openAddTaskPage(status) {
  const addTaskPage = `../html/add-task.html?status=${status}`;
  window.location.href = addTaskPage;
}

// #endregion
