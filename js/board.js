let tasksData = [];

async function initBoard() {
  await fetchAllTasks();
  renderTasks(tasksData);
}


async function fetchAllTasks() {
  try {
    const response = await fetch("../js/tasks.json");
    const responseToJson = await response.json();
    tasksData = responseToJson;
  } catch (error) {
    console.error(error);
  }
}


function renderTasks(tasksData) {
  for (let i = 0; i < tasksData.length; i++) {
    const taskID = tasksData[i].id;
    renderOneTask(taskID)
  }
  checkForEmptyColumn()
}


function renderOneTask(taskID) {
  const {category, title, description, priority, assignedTo, status: columnName, subtasks,} 
      = tasksData[tasksData.findIndex(task => task.id === taskID)];
    const colorLabel = (category == "User Story") ? "color-label-user-story" : "color-label-technical-task";
    const doneSubtasks = checkDoneSubtasks(subtasks);
    document.getElementById(columnName).innerHTML 
      += templateTaskCard({taskID, category, colorLabel, title, description, priority, doneSubtasks, subtasksLength: subtasks.length});
    renderTaskAvatars(taskID, assignedTo);
}


function checkDoneSubtasks(taskSubtasks) {
  let counter = 0;
  for (let i = 0; i < taskSubtasks.length; i++) {
    counter += taskSubtasks[i].done ? 1 : 0;
  }
  return counter;
}


function renderTaskAvatars(taskID, taskAvatars) {
  for (let i = 0; i < taskAvatars.length; i++) {
    const colorAvatar = "rgba(18 70 88 / 100%)";
    document.getElementById(`avatarsContainer${taskID}`).innerHTML +=
      templateTaskAvatar(colorAvatar, taskAvatars[i]);
  }
}


function checkForEmptyColumn() {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID)
      document.getElementById(emptyColumnID).innerHTML = templateEmptyColumn(emptyColumnName);
    }
  }
}


function getColumnName(columnID) {
  const columnName = "";
  switch (columnID) {
    case "toDo": columnName = "To Do";
      break;
    case "inProgress": columnName = "In progress";
      break; 
    case "awaitFeedback": columnName = "Await feedback";
      break;
    case "done": columnName = "Done";
      break;
  }
  return columnName;
}
