let tasks = [];

async function init() {
  await window.getCurrentUser();
  await getSummaryData();
  getStatusInformation();
}


async function getSummaryData() {
  const idToken = await window.auth.currentUser.getIdToken();
  const response = await fetch(
    `https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/tasks.json?auth=${idToken}`,
  );
  const data = await response.json();
  tasks = Object.values(data);
}


function getStatusInformation() {
  const urgentTasks = getStatusUrgent();
  const summaryList = document.querySelector("#summary_list");
  const statusCounts = getStatusCounts();
  summaryList.innerHTML = "";
  summaryList.innerHTML = generateSummaryHTM(statusCounts, tasks, urgentTasks);
}


function getStatusCounts() {
  const statusCounts = { toDo: 0, inProgress: 0, awaitFeedback: 0, done: 0 };

  for (const task of tasks) {
    statusCounts.toDo += countStatus(task, "toDo");
    statusCounts.inProgress += countStatus(task, "inProgress");
    statusCounts.awaitFeedback += countStatus(task, "awaitFeedback");
    statusCounts.done += countStatus(task, "done");
  }

  return statusCounts;
}


function countStatus(task, status) {
  let counter = 0;
  if (task.status === status) {
    counter++;
  }
  return counter;
}


function getStatusUrgent() {
  let counterUrgent = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (task.priority === "urgent") {
      counterUrgent++;
    }
  }

  return counterUrgent;
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
