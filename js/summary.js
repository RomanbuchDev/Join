let tasks = [];

async function init() {
  await getSummaryData();
  getStatusInformation();
}


async function getSummaryData() {
  const response = await fetch("../js/tasks.json");
  const data = await response.json();

  tasks = data;
}


function getStatusInformation() {
  const statusCounts = getStatusCounts();
  logStatusCounts(statusCounts);
}


function getStatusCounts() {
  const statusCounts = { todo: 0, inProgress: 0, awaitFeedback: 0, done: 0 };

  for (const task of tasks) {
    statusCounts.todo += countStatus(task, "todo");
    statusCounts.inProgress += countStatus(task, "in-progress");
    statusCounts.awaitFeedback += countStatus(task, "await-feedback");
    statusCounts.done += countStatus(task, "done");
  }

  return statusCounts;
}


function logStatusCounts(statusCounts) {
  console.log("Status ToDo: ", statusCounts.todo);
  console.log("Status In Progress: ", statusCounts.inProgress);
  console.log("Status Await Feedback: ", statusCounts.awaitFeedback);
  console.log("Status Done: ", statusCounts.done);
}


function countStatus(task, status) {
  let counter = 0;
  if (task.status === status) {
    counter++;
  }
  return counter;
}


function changeFillIcon(element, action) {
  const circle = element.querySelector(".icon_circle");
  const motif = element.querySelector(".icon_motif");

  circle.setAttribute("fill", action === "start" ? "white" : "#2A3647");
  motif.setAttribute("fill", action === "start" ? "#2A3647" : "white");
}


function changeStrokeIcon(element, action) {
  const circle = element.querySelector(".icon_circle");
  const motif = element.querySelector(".icon_motif");

  circle.setAttribute("fill", action === "start" ? "white" : "#2A3647");
  motif.setAttribute("stroke", action === "start" ? "#2A3647" : "white");
}

init();
