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
}


function renderOneTask(taskID) {
  const {category, title, description, priority, assignedTo, status, subtasks,} 
      = tasksData[tasksData.findIndex(task => task.id === taskID)];
    const colorLabel = (category == "User Story") ? "color-label-user-story" : "color-label-technical-task";
    const doneSubtasks = checkDoneSubtasks(subtasks);
    document.getElementById(status).innerHTML 
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
