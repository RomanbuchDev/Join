// #region OVERLAY ADD 
function templateOverlayAddFrame(dialogID) {
  return /*html*/ `
    <header class="overlay-header d-flex">
      <h2 class="overlay-h2">Add Task</h2>
      ${templateCloseButton(dialogID)}
    </header>
    ${getTaskFormTemplate({
      submitHandler: "createTask(event, finishAddSubmit)", 
      actions: templateOverlayAddActions()
    })}`;
}


function templateCloseButton(dialogID) {
  return /*html*/ `
    <button type="button" aria-label="Close overlay"
      class="button-reset"
      onclick="handleOverlayCloseRequest('${escapeHtml(dialogID)}')">
      <svg
        class="svg-fill svg-width-height-18px"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
      >
        <path d="M6.575 7.975L1.675 12.875C1.49167 13.0583 1.25833 13.15 0.975 13.15C0.691667 13.15 0.458333 13.0583 0.275 12.875C0.0916667 12.6917 0 12.4583 0 12.175C0 11.8917 0.0916667 11.6583 0.275 11.475L5.175 6.575L0.275 1.675C0.0916667 1.49167 0 1.25833 0 0.975C0 0.691667 0.0916667 0.458333 0.275 0.275C0.458333 0.0916667 0.691667 0 0.975 0C1.25833 0 1.49167 0.0916667 1.675 0.275L6.575 5.175L11.475 0.275C11.6583 0.0916667 11.8917 0 12.175 0C12.4583 0 12.6917 0.0916667 12.875 0.275C13.0583 0.458333 13.15 0.691667 13.15 0.975C13.15 1.25833 13.0583 1.49167 12.875 1.675L7.975 6.575L12.875 11.475C13.0583 11.6583 13.15 11.8917 13.15 12.175C13.15 12.4583 13.0583 12.6917 12.875 12.875C12.6917 13.0583 12.4583 13.15 12.175 13.15C11.8917 13.15 11.6583 13.0583 11.475 12.875L6.575 7.975Z"/>
      </svg>
    </button>`;
}


function templateOverlayAddActions() {
  return /*html*/ `
    <div class="form-actions">
      <span class="required-hint required-hint--desktop">
        <span class="required-marker" aria-hidden="true">*</span>
        This field is required
      </span>
      <button type="button" class="form-action form-action--clear"
        onclick="handleOverlayCloseRequest('dialogAddTask')">Cancel ✕</button>
      <button type="submit" class="form-action form-action--create">Create Task ✓</button>
    </div>`;
}

// #endregion

// #region OVERLAY TASK
/**
 * Returns the HTML template of the overlay frame: header with category label and close button,
 * and empty containers for the main part and the footer.
 * @param {string} taskID - The ID of the task.
 * @param {string} categoryColor - The CSS class for the color of the category label.
 * @returns {string} The HTML string of the overlay frame.
 */
function templateOverlayTaskFrame(taskID, categoryColor) {
  const task = allTasks[taskID];
  return /*html*/ `
    <header class="overlay-header d-flex">
      <h3 class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(task.category)}</h3>
      ${templateCloseButton('dialogDetailedTask')}
    </header>
    <section id="overlayMain${escapeHtml(taskID)}" class="overlay-main d-flex"></section>
    <footer id="overlayFooter${escapeHtml(taskID)}" class="overlay-footer d-flex"></footer>`;
}


/**
 * Returns the HTML template of the main part of the detail view: title, due date and containers
 * for description, priority, assignees and subtasks, which are filled in afterwards.
 * @param {string} taskID - The ID of the task.
 * @returns {string} The HTML string of the main part.
 */
function templateOverlayMainDetails(taskID) {
  const task = allTasks[taskID];
  return /*html*/ `
    <h2 class="overlay-h2">${escapeHtml(task.title)}</h2>
    <p id="overlayDescription${escapeHtml(taskID)}" class="overlay-description"></p>
    <div class="overlay-detail-row d-flex">
      <h4>Due date:</h4>
      <p>${escapeHtml(getFormattedDueDate(taskID))}</p>
    </div>
    <div class="overlay-detail-row d-flex">
      <h4>Priority:</h4>
      <p id="overlayPriority${escapeHtml(taskID)}" class="overlay-priority d-flex"></p>
    </div>
    <div id="overlayAssigneesContainer${escapeHtml(taskID)}" class="overlay-detail-column d-flex"></div>
    <div id="overlaySubtasksContainer${escapeHtml(taskID)}" class="overlay-detail-column d-flex"></div>`;
}


/**
 * Returns the HTML template of the footer of the detail view with the delete and the edit button.
 * @param {string} taskID - The ID of the task.
 * @returns {string} The HTML string of the footer.
 */
function templateOverlayFooterDetails(taskID) {
  return /*html*/ `
    <button type="button" class="button-delete-edit button-reset d-flex"
      onclick="openDialogTaskDeleteQuestion('${escapeHtml(taskID)}')">
      <svg
        class="svg-fill svg-width-height-delete"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 18"
      >
        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z"/>
      </svg>
      <span>Delete</span>
    </button>
    <div class="divider-line"></div>
    <button type="button" class="button-delete-edit button-reset d-flex"
      onclick="openEditView('${escapeHtml(taskID)}')">
      <svg
        class="svg-fill svg-width-height-18px"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
      >
        <path d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z"/>
      </svg>
      <span>Edit</span>
    </button>`;
}


/**
 * Returns the HTML template of the priority with text and icon.
 * @param {string} priorityString - The priority as text to display, e.g. "Medium".
 * @param {string} priority - The priority as stored in the task, used for the icon file.
 * @returns {string} The HTML string of the priority.
 */
function templateOverlayPriority(priorityString, priority) {
  return /*html*/ `
    <span>${escapeHtml(priorityString)}</span>
    <img draggable="false"
      src="../assets/icons/prio-${escapeHtml(priority)}-symbol.svg"
      alt="${escapeHtml(priority)} priority task"
    />`;
}


/**
 * Returns the HTML template of the assignee section with its heading and an empty list.
 * @param {string} taskID - The ID of the task.
 * @returns {string} The HTML string of the assignee section.
 */
function templateOverlayAssignees(taskID) {
  return /*html*/ `
    <h4>Assigned to:</h4>
    <ul id="overlayAssignees${escapeHtml(taskID)}"
      class="overlay-assignees d-flex"
    ></ul>`;
}


/**
 * Returns the HTML template of one assignee in the overlay with avatar and name.
 * @param {string} assigneeColor - The background color of the avatar.
 * @param {string} assigneeShortcut - The shortcut shown in the avatar.
 * @param {string} assigneeName - The name of the assignee.
 * @returns {string} The HTML string of the assignee.
 */
function templateOverlayOneAssignee(assigneeColor, assigneeShortcut, assigneeName) {
  return /*html*/ `
    <li class="overlay-assignee d-flex">
      <span class="overlay-task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">
        ${escapeHtml(assigneeShortcut)}
      </span>
      <span>${escapeHtml(assigneeName)}</span>
    </li>`;
}


/**
 * Returns the HTML template of the subtask section with its heading and an empty list.
 * @param {string} taskID - The ID of the task.
 * @returns {string} The HTML string of the subtask section.
 */
function templateOverlaySubtasks(taskID) {
  return /*html*/ `
    <h4>Subtasks:</h4>
    <ul id="overlaySubtasks${escapeHtml(taskID)}"></ul>`;
}


/**
 * Returns the HTML template of one subtask with a checkbox that is checked if the subtask is done.
 * @param {string} taskID - The ID of the task.
 * @param {number} indexSubtask - The index of the subtask in the task.
 * @returns {string} The HTML string of the subtask.
 */
function templateOverlayOneSubtask(taskID, indexSubtask) {
  const subtask = allTasks[taskID].subtasks[indexSubtask];
  const checked = subtask.done ? "checked" : "";
  return /*html*/ `
    <li class="d-flex">
      <input type="checkbox" ${checked}  
        id="checkSubtask${escapeHtml(taskID)}_${indexSubtask}"
        class="subtask-checkbox"
        onchange="toggleSubtask(event, '${escapeHtml(taskID)}', ${indexSubtask})"
        />
      <label for="checkSubtask${escapeHtml(taskID)}_${indexSubtask}"
        class="overlay-subtask-text">
        ${escapeHtml(subtask.text)}
      </label>
    </li>`;
}

// #endregion

// #region OVERLAY EDIT
/**
 * Returns the HTML template of the main part of the edit view: the task form without category field
 * and action buttons, with the priority of the task preselected (fallback "medium").
 * @param {string} taskID - The ID of the task.
 * @returns {string} The HTML string of the main part.
 */
function templateOverlayMainEdit(taskID) {
  return /*html*/ `
    ${getTaskFormTemplate({
      submitHandler: `handleEditSubmit(event, '${escapeHtml(taskID)}')`,
      resetHandler: "",
      priority: allTasks[taskID].priority || "medium",
      showCategory: false,
      actions: ""
    })}`;
}


/**
 * Returns the HTML template of the footer of the edit view with the "Ok" button.
 * The button submits the task form (ID "task-form").
 * @returns {string} The HTML string of the footer.
 */
function templateOverlayFooterEdit() {
  return /*html*/ `
    <button
      id="submitEdit"
      class="button-basic button-primary"
      type="submit"
      form="task-form">
      <span>Ok</span>
      <img src="../assets/icons/check.svg" alt="check icon" />
    </button>`;
}

// #endregion

// #region DELETE QUESTION
/**
 * Returns the HTML template of the confirmation question for deleting a task, with a "NO" and a "YES" button.
 * @param {string} taskID - The ID of the task to delete.
 * @returns {string} The HTML string of the dialog content.
 */
function templateDeleteQuestion(taskID) {
  return /*html*/ `
    <form method="dialog">
      <h4 id="delete-question-title">Delete task</h4>
      <p id="delete-question-text">
        Do you really want to delete this task?
      </p>
      <div class="delete-question-button-container">
        <button
          type="button"
          class="button-basic button-secondary delete-question-button"
          onclick="closeDialogDeleteQuestion()"
        >
          NO
        </button>
        <button
          type="submit"
          class="button-basic button-primary delete-question-button"
          onclick="deleteTask(event, '${escapeHtml(taskID)}')"
          autofocus
        >
          YES
        </button>
      </div>
    </form>`;
}
// #endregion
