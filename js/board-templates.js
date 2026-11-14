/**
 * JavaScript file for the templates of the board page.
 */

// #region TASK CARD
/**
 * Returns the HTML template of a task card.
 * Description, progress bar and assignees are filled in afterwards.
 * @param {string} taskID - The ID of the task.
 * @param {string} categoryColor - The CSS class for the color of the category label.
 * @returns {string} The HTML string of the task card.
 */
function templateTaskCard(taskID, categoryColor) {
  return /*html*/ `
    <li data-task-id="${escapeHtml(taskID)}" data-task-status="${escapeHtml(allTasks[taskID].status)}" 
      class="task-card d-flex" onclick="handleTaskCardClick(event, '${escapeHtml(taskID)}')"
      draggable="true" ondragstart="handleDragstart(event)" ondragend="handleDragend()">
      <section class="label-move-container d-flex">
        <h3 class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(allTasks[taskID].category)}</h3>
        <div class="move-menu-container">
          <button class="button-reset" type="button" aria-label="Open move menu"
            onclick="toggleMenu(this, 'move-menu-dropdown${escapeHtml(taskID)}')" aria-expanded="false" aria-controls="move-menu">
            <svg 
              class="svg-fill svg-width-height-move"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 26"
            > 
              <path fill-rule="evenodd" d="M6 0H18A6 6 0 0 1 24 6V20A6 6 0 0 1 18 26H6A6 6 0 0 1 0 20V6A6 6 0 0 1 6 0ZM6 1.5H18A4.5 4.5 0 0 1 22.5 6V20A4.5 4.5 0 0 1 18 24.5H6A4.5 4.5 0 0 1 1.5 20V6A4.5 4.5 0 0 1 6 1.5Z"/>
              <path d="M15.3333 18.1457L16.8958 16.5832C17.0486 16.4304 17.2396 16.354 17.4688 16.354C17.6979 16.354 17.8958 16.4304 18.0625 16.5832C18.2292 16.7498 18.3125 16.9478 18.3125 17.1769C18.3125 17.4061 18.2292 17.604 18.0625 17.7707L15.0833 20.7498C15 20.8332 14.9097 20.8922 14.8125 20.9269C14.7153 20.9616 14.6111 20.979 14.5 20.979C14.3889 20.979 14.2847 20.9616 14.1875 20.9269C14.0903 20.8922 14 20.8332 13.9167 20.7498L10.9167 17.7498C10.75 17.5832 10.6701 17.3887 10.6771 17.1665C10.684 16.9443 10.7708 16.7498 10.9375 16.5832C11.1042 16.4304 11.2986 16.3505 11.5208 16.3436C11.7431 16.3366 11.9375 16.4165 12.1042 16.5832L13.6667 18.1457V12.9998C13.6667 12.7637 13.7465 12.5658 13.9062 12.4061C14.066 12.2464 14.2639 12.1665 14.5 12.1665C14.7361 12.1665 14.934 12.2464 15.0938 12.4061C15.2535 12.5658 15.3333 12.7637 15.3333 12.9998V18.1457ZM10.3333 7.854V12.9998C10.3333 13.2359 10.2535 13.4339 10.0938 13.5936C9.93403 13.7533 9.73611 13.8332 9.5 13.8332C9.26389 13.8332 9.06597 13.7533 8.90625 13.5936C8.74653 13.4339 8.66667 13.2359 8.66667 12.9998V7.854L7.10417 9.4165C6.95139 9.56928 6.76042 9.64567 6.53125 9.64567C6.30208 9.64567 6.10417 9.56928 5.9375 9.4165C5.77083 9.24984 5.6875 9.05192 5.6875 8.82275C5.6875 8.59359 5.77083 8.39567 5.9375 8.229L8.91667 5.24984C9 5.1665 9.09028 5.10748 9.1875 5.07275C9.28472 5.03803 9.38889 5.02067 9.5 5.02067C9.61111 5.02067 9.71528 5.03803 9.8125 5.07275C9.90972 5.10748 10 5.1665 10.0833 5.24984L13.0833 8.24984C13.25 8.4165 13.3299 8.61095 13.3229 8.83317C13.316 9.05539 13.2292 9.24984 13.0625 9.4165C12.8958 9.56928 12.7014 9.64914 12.4792 9.65609C12.2569 9.66303 12.0625 9.58317 11.8958 9.4165L10.3333 7.854Z"/>
            </svg>
          </button>
          <section id="move-menu-dropdown${escapeHtml(taskID)}" class="move-menu-dropdown d-flex">
            <h5>Move to ...</h5>
            <ol class="move-menu d-flex">
              <li data-destination-status="toDo" onclick="moveTaskViaButton(event)">To do</li>
              <li data-destination-status="inProgress" onclick="moveTaskViaButton(event)">In progress</li>
              <li data-destination-status="awaitFeedback" onclick="moveTaskViaButton(event)">Await feedback</li>
              <li data-destination-status="done" onclick="moveTaskViaButton(event)">Done</li>
            </ol>
          </section>
        </div>
      </section>
      <div class="task-title-description-container d-flex">
        <h4>${escapeHtml(allTasks[taskID].title)}</h4>
        <p id="description${escapeHtml(taskID)}" class="task-description"></p>
      </div>
      <div id="progressContainer${escapeHtml(taskID)}" class="task-progress d-flex">
      </div>
      <div class="task-card-footer d-flex">
        <ul id="assigneesContainer${escapeHtml(taskID)}" class="task-avatars-container d-flex">
        </ul>
        <div class="priority-icon d-flex">
          <img draggable="false"
            src="../assets/icons/prio-${escapeHtml(allTasks[taskID].priority)}-symbol.svg"
            alt="${escapeHtml(allTasks[taskID].priority)} priority task"
          />
        </div>
      </div>
    </li>`;
}
// #endregion


// #region TASK DETAILS
/**
 * Returns the HTML template of the progress bar of a task card.
 * @param {number} doneSubtasks - The number of completed subtasks.
 * @param {number} subtasksLength - The total number of subtasks.
 * @returns {string} The HTML string of the progress bar and the subtask counter.
 */
function templateProgressBar(doneSubtasks, subtasksLength) {
  return /*html*/ `
    <progress value="${doneSubtasks}" max="${subtasksLength}"></progress>
    <p>${doneSubtasks}/${subtasksLength} Subtasks</p>`
}


/**
 * Returns the HTML template of one assignee avatar on a task card.
 * @param {string} assigneeColor - The background color of the avatar.
 * @param {string} assigneeShortcut - The shortcut of the assignee shown in the avatar.
 * @returns {string} The HTML string of the avatar.
 */
function templateTaskAssignee(assigneeColor, assigneeShortcut) {
  return /*html*/ `
    <li class="task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">
      ${escapeHtml(assigneeShortcut)}
    </li>`
}


/**
 * Returns the HTML template of the message for an empty column.
 * @param {string} columnName - The display name of the column.
 * @returns {string} The HTML string of the message.
 */
function templateEmptyColumn(columnName) {
  return /*html*/ `
    <li class="empty-column-message d-flex">
      <p>No tasks ${escapeHtml(columnName)}</p>
    </li>`
}
// #endregion


// #region OVERLAY
function templateOverlayDetailedTask(taskID, categoryColor) {
  return /*html*/ `
    <header class="overlay-header d-flex">
      <h3 class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(allTasks[taskID].category)}</h3>
      <button type="button" aria-label="Close overlay"
        onclick="closeTaskOverlay()">
        x
      </button>
    </header>
    <main class="overlay-main d-flex">
      <h1>${escapeHtml(allTasks[taskID].title)}</h1>
      <p id="overlayDescription${escapeHtml(taskID)}"></p>
      <div class="overlay-detail-row d-flex">
        <h2>Due date:</h2>
        <p>${escapeHtml(getTaskDate(taskID))}</p>
      </div>
      <div class="overlay-detail-row d-flex">
        <h2>Priority:</h2>
        <p id="overlayPriority${escapeHtml(taskID)}"></p>
      </div>
      <div id="overlayAssigneesContainer${escapeHtml(taskID)}" class="overlay-detail-column d-flex"></div>
      <!-- <div id="overlaySubtasksContainer${escapeHtml(taskID)}" class="overlay-detail-column d-flex"></div> -->
    </main>
    <footer class="overlay-footer d-flex">
      <button type="button">
        <svg
          class="svg-fill svg-width-height-delete"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 18"
        >
          <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"/>
        </svg>
        Delete
      </button>
      <div class="divider-line"></div>
      <button type="button">
        <svg
          class="svg-fill svg-width-height-edit"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 18 18"
        >
          <path d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z"/>
        </svg>
        Edit
      </button>
    </footer>`
}


function templateOverlayPriority(taskID, priorityString) {
  return /*html*/ `
    ${escapeHtml(priorityString)}
    <img draggable="false"
      src="../assets/icons/prio-${escapeHtml(allTasks[taskID].priority)}-symbol.svg"
      alt="${escapeHtml(allTasks[taskID].priority)} priority task"
    />`
}


function templateOverlayAssignees(taskID) {
  return /*html*/ `
    <h2>Assigned to:</h2>
    <ul id="overlayAssignees${escapeHtml(taskID)}">
    </ul>`
}


function templateOverlayOneAssignee(assigneeColor, assigneeShortcut, assigneeName) {
  return /*html*/ `
    <li class="d-flex">
      <span class="overlay-task-avatar" style="background-color:${escapeHtml(assigneeColor)}">
        ${escapeHtml(assigneeShortcut)}
      </span>
      <span>${escapeHtml(assigneeName)}</span>
    </li>`
}


// function templateOverlaySubtasks(taskID) {
//   return /*html*/ `
//     <h2>Subtasks:</h2>
//     <ul id="overlaySubtasks${escapeHtml(taskID)}">
//     </ul>`
// }


// function templateOverlayOneSubtask() {
//   return /*html*/ `
//     <li>
//       <p></p>
//     </li>`
// }
// #endregion
