let tasks = [];

/**
 * Initializes the header, loads tasks, renders the summary and greeting,
 * and clears the loading state.
 * @returns {Promise<void>} Resolves when initialization is complete.
 */
async function init() {
  // const user = await initHeader(); // Header läuft jetzt zentral über initHeaderAuthUI() in script.js
  const user = await window.getCurrentUser(); // user wird hier nur noch für die Begrüßung gebraucht
  await getSummaryData();
  getStatusInformation();
  renderDates();
  rederGreeting(user.isGuest === true ? "" : user.name);
  document.body.classList.remove("is-loading");
}


/**
 * Loads tasks from Firebase using the current user's ID token
 * and stores them in the global tasks array.
 * @returns {Promise<void>} Resolves when the tasks array has been updated.
 * @throws {Error} If authentication, fetching, or processing the task data fails.
 */
async function getSummaryData() {
  const idToken = await window.auth.currentUser.getIdToken();
  const response = await fetch(
    `https://join-7252c-default-rtdb.europe-west1.firebasedatabase.app/tasks.json?auth=${idToken}`,
  );
  const data = await response.json();
  tasks = Object.values(data);
}


/**
 * Renders the summary cards using task status counts,
 * the total task count, and the urgent task count.
 * @returns {void}
 */
function getStatusInformation() {
  const urgentTasks = getStatusUrgent();
  const summaryList = document.querySelector("#summary_list");
  const statusCounts = getStatusCounts();
  summaryList.innerHTML = "";
  summaryList.innerHTML = generateSummaryHTM(statusCounts, tasks, urgentTasks);
}


/**
 * Counts tasks in each supported status using the global tasks array.
 * @returns {{toDo: number, inProgress: number, awaitFeedback: number, done: number}} The task counts by status.
 */
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


/**
 * Checks whether a task matches the given status.
 * @param {Object} task - The task to check.
 * @param {string} task.status - The task's current status.
 * @param {string} status - The status to compare against.
 * @returns {0|1} One if the status matches, otherwise zero.
 */
function countStatus(task, status) {
  let counter = 0;
  if (task.status === status) {
    counter++;
  }
  return counter;
}


/**
 * Counts tasks with urgent priority in the global tasks array.
 * @returns {number} The number of urgent tasks.
 */
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


/**
 * Updates the circle and motif fill colors for the card's hover state.
 * @param {HTMLElement} element - The summary card containing the SVG icon.
 * @param {"start"|"end"} action - Whether the hover state starts or ends.
 * @returns {void}
 */
function changeFillIcon(element, action) {
  const circle = element.querySelector(".icon_circle");
  const motif = element.querySelector(".icon_motif");

  circle.setAttribute("fill", action === "start" ? "white" : "#2A3647");
  motif.setAttribute("fill", action === "start" ? "#2A3647" : "white");
}


/**
 * Updates the circle fill and motif stroke colors for the card's hover state.
 * @param {HTMLElement} element - The summary card containing the SVG icon.
 * @param {"start"|"end"} action - Whether the hover state starts or ends.
 * @returns {void}
 */
function changeStrokeIcon(element, action) {
  const circle = element.querySelector(".icon_circle");
  const motif = element.querySelector(".icon_motif");

  circle.setAttribute("fill", action === "start" ? "white" : "#2A3647");
  motif.setAttribute("stroke", action === "start" ? "#2A3647" : "white");
}


/**
 * Displays the next upcoming task deadline or a message if none is found.
 * @returns {void}
 */
function renderDates() {
  const nextTask = getNextUpcomingTask();
  const deadlineElement = document.getElementById("upcoming-deadline");

  if (!nextTask) {
    deadlineElement.textContent = "No upcoming deadline";
    return;
  }

  updateDeadlineElement(deadlineElement, nextTask);
}


/**
 * Finds the task with the earliest due date that is today or later.
 * @returns {Object|undefined} The next upcoming task, or undefined if none is found.
 */
function getNextUpcomingTask() {
  const now = new Date().setHours(0, 0, 0, 0);
  let nextTask;

  for (const task of tasks) {
    if (isEarlierUpcomingTask(task, nextTask, now)) nextTask = task;
  }

  return nextTask;
}


/**
 * Checks whether a task is due on or after the reference time
 * and earlier than the current candidate, if one exists.
 * @param {Object} task - The task to check.
 * @param {Object|undefined} nextTask - The current earliest upcoming task.
 * @param {number} now - The reference timestamp in milliseconds.
 * @returns {boolean} Whether the task should replace the current candidate.
 */
function isEarlierUpcomingTask(task, nextTask, now) {
  const dueDate = getDueDateTime(task);

  if (dueDate < now) return false;
  if (!nextTask) return true;

  return dueDate < getDueDateTime(nextTask);
}


/**
 * Converts a task's due date to a timestamp at local midnight.
 * @param {Object} task - The task containing the due date.
 * @param {string} task.dueDate - The due date in YYYY-MM-DD format.
 * @returns {number} The timestamp in milliseconds, or NaN if the date is invalid.
 */
function getDueDateTime(task) {
  return new Date(task.dueDate + "T00:00:00").getTime();
}


/**
 * Updates the deadline element's machine-readable date and displayed text.
 * @param {HTMLTimeElement} deadlineElement - The time element to update.
 * @param {Object} task - The task containing the deadline.
 * @param {string} task.dueDate - The due date in YYYY-MM-DD format.
 * @returns {void}
 */
function updateDeadlineElement(deadlineElement, task) {
  const deadline = new Date(task.dueDate + "T00:00:00");

  deadlineElement.dateTime = task.dueDate;
  deadlineElement.textContent = formatDeadline(deadline);
}


/**
 * Formats a deadline using the US English month name, day, and year.
 * @param {Date} deadline - The date to format.
 * @returns {string} The formatted date, such as "November 20, 2026".
 */
function formatDeadline(deadline) {
  return deadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/**
 * Displays the time-based greeting with a name and comma,
 * or an exclamation mark and hidden name field for guests.
 * @param {string} [userName=""] - The user's display name, or an empty string for guests.
 * @returns {void}
 */
function rederGreeting(userName = "") {
  const greetingText = document.querySelector(".greeting__text");
  const greetingName = document.querySelector(".greeting__name");
  const greeting = getGreeting();

  greetingText.textContent = userName === "" ? greeting + "!" : greeting + ",";
  greetingName.textContent = userName;
  greetingName.hidden = userName === "";
}

init();
