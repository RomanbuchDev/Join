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
  const statusOptions = ["todo", "in-progress", "await-feedback", "done"];
  let numberOfToDos = 0;
  let numberOfInProgress = 0;
  let numberOfAwaitFeedback = 0;
  let numberOfDone = 0;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    numberOfToDos += countStatus(task, "todo");
    numberOfInProgress += countStatus(task, "in-progress");
    numberOfAwaitFeedback += countStatus(task, "await-feedback");
    numberOfDone += countStatus(task, "done");
  }
  console.log("Status ToDo: ", numberOfToDos);
  console.log("Status In Progress: ", numberOfInProgress);
  console.log("Status Await Feedback: ", numberOfAwaitFeedback);
  console.log("Status Done: ", numberOfDone);
}

function countStatus(task, status) {
  let counter = 0;
  if (task.status === status) {
    counter++;
  }
  return counter;
}

init();
