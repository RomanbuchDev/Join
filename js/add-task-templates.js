function getAddTaskTemplate() {
  return /*html*/ `
    ${getAddTaskHeaderTemplate()}
    ${getTaskFormTemplate()}
  `;
}


function getTaskFormTemplate(options = {}) {
  const settings = Object.assign(
    {
      submitHandler: "createTask(event)",
      resetHandler: "clearTaskForm()",
      priority: "medium",
      category: "",
      actions: getTaskActionsTemplate(),
    },
    options,
  );

  return /*html*/ `
    <form
      id="task-form"
      onsubmit="${settings.submitHandler}"
      onreset="${settings.resetHandler}"
    >
      ${getTaskFieldsTemplate(settings.priority, settings.category)}
      ${settings.actions}
    </form>
  `;
}


function getAddTaskHeaderTemplate() {
  return /*html*/ `
    <header class="add-task-header">
      <h1>Add Task</h1>
    </header>
  `;
}


function getCheckedAttribute(currentPriority, priority) {
  return currentPriority === priority ? "checked" : "";
}


function getSelectedAttribute(currentCategory, category) {
  return currentCategory === category ? "selected" : "";
}


function getCategoryPlaceholderAttribute(category) {
  const categories = ["User Story", "Technical Task"];
  return categories.includes(category) ? "" : "selected";
}


function getTaskFieldsTemplate(priority = "medium", category = "") {
  return /*html*/ `
    <div class="form-content">
      <div class="form-column form-column--left">
        <div class="form-field form-field--title">
          <label class="required-label" for="title">Title</label>
          <input
            class="form-control form-control--title"
            id="title"
            name="title"
            type="text"
            placeholder="Enter a title"
            required
          />
        </div>

        <div class="form-field form-field--description">
          <label for="description">Description</label>
          <textarea
            class="form-control form-control--description"
            name="description"
            id="description"
            placeholder="Enter a Description"
          ></textarea>
        </div>

        <div class="form-field form-field--due-date">
          <label class="required-label" for="due-date">Due date</label>
          <input
            class="form-control form-control--date"
            type="date"
            name="due-date"
            id="due-date"
            required
          />
        </div>
      </div>

      <div class="form-column form-column--right">
        <fieldset class="form-field form-field--priority">
          <legend>Priority</legend>

          <div class="priority-options">
            <div class="priority-option">
              <input
                class="priority-radio"
                type="radio"
                id="priority-urgent"
                name="priority"
                value="urgent"
                ${getCheckedAttribute(priority, "urgent")}
              />

              <label for="priority-urgent">
                Urgent

                <svg
                  class="priority-icon"
                  width="20"
                  height="15"
                  viewBox="0 0 20 15"
                  fill="rgba(255 61 0 / 100%)"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.9043 14.5096C18.6696 14.51 18.4411 14.4351 18.2522 14.2961L10.0001 8.21288L1.74809 14.2961C1.63224 14.3816 1.50066 14.4435 1.36086 14.4783C1.22106 14.513 1.07577 14.5199 0.933305 14.4986C0.790837 14.4772 0.653973 14.428 0.530528 14.3538C0.407083 14.2796 0.299474 14.1818 0.213845 14.0661C0.128216 13.9503 0.0662437 13.8188 0.0314671 13.6791C-0.00330956 13.5394 -0.0102098 13.3943 0.0111604 13.2519C0.0543195 12.9644 0.21001 12.7058 0.443982 12.533L9.34809 5.96249C9.53679 5.8229 9.76536 5.74756 10.0001 5.74756C10.2349 5.74756 10.4635 5.8229 10.6522 5.96249L19.5563 12.533C19.7422 12.6699 19.8801 12.862 19.9503 13.0819C20.0204 13.3018 20.0193 13.5382 19.9469 13.7573C19.8746 13.9765 19.7349 14.1673 19.5476 14.3024C19.3604 14.4375 19.1352 14.51 18.9043 14.5096Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M18.9043 8.76057C18.6696 8.76097 18.4411 8.68612 18.2522 8.54702L10.0002 2.46386L1.7481 8.54702C1.51412 8.71983 1.22104 8.79269 0.93331 8.74956C0.645583 8.70643 0.386785 8.55086 0.213849 8.31706C0.0409137 8.08326 -0.0319941 7.79039 0.011165 7.50288C0.054324 7.21536 0.210015 6.95676 0.443986 6.78395L9.3481 0.213471C9.5368 0.0738799 9.76537 -0.00146484 10.0002 -0.00146484C10.2349 -0.00146484 10.4635 0.0738799 10.6522 0.213471L19.5563 6.78395C19.7422 6.92087 19.8801 7.11298 19.9503 7.33286C20.0204 7.55274 20.0193 7.78914 19.947 8.00832C19.8746 8.22751 19.7349 8.41826 19.5476 8.55335C19.3604 8.68844 19.1352 8.76096 18.9043 8.76057Z"
                  />
                </svg>
              </label>
            </div>

            <div class="priority-option">
              <input
                class="priority-radio"
                type="radio"
                id="priority-medium"
                name="priority"
                value="medium"
                ${getCheckedAttribute(priority, "medium")}
              />

              <label for="priority-medium">
                Medium

                <svg
                  class="priority-icon"
                  width="20"
                  height="8"
                  viewBox="0 0 20 8"
                  fill="rgba(255 168 0 / 100%)"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.9041 7.45086H1.09589C0.805242 7.45086 0.526498 7.33456 0.320979 7.12755C0.11546 6.92054 0 6.63977 0 6.34701C0 6.05425 0.11546 5.77349 0.320979 5.56647C0.526498 5.35946 0.805242 5.24316 1.09589 5.24316H18.9041C19.1948 5.24316 19.4735 5.35946 19.679 5.56647C19.8845 5.77349 20 6.05425 20 6.34701C20 6.63977 19.8845 6.92054 19.679 7.12755C19.4735 7.33456 19.1948 7.45086 18.9041 7.45086Z"
                    fill="#FFA800"
                  />
                  <path
                    d="M18.9041 2.2077H1.09589C0.805242 2.2077 0.526498 2.0914 0.320979 1.88439C0.11546 1.67738 0 1.39661 0 1.10385C0 0.81109 0.11546 0.530322 0.320979 0.32331C0.526498 0.116298 0.805242 0 1.09589 0L18.9041 0C19.1948 0 19.4735 0.116298 19.679 0.32331C19.8845 0.530322 20 0.81109 20 1.10385C20 1.39661 19.8845 1.67738 19.679 1.88439C19.4735 2.0914 19.1948 2.2077 18.9041 2.2077Z"
                  />
                </svg>
              </label>
            </div>

            <div class="priority-option">
              <input
                class="priority-radio"
                type="radio"
                id="priority-low"
                name="priority"
                value="low"
                ${getCheckedAttribute(priority, "low")}
              />

              <label for="priority-low">
                Low

                <svg
                  class="priority-icon"
                  width="20"
                  height="15"
                  viewBox="0 0 20 15"
                  fill="rgba(122 226 41 / 100%)"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 8.76077C9.7654 8.76118 9.53687 8.68634 9.34802 8.54726L0.444913 1.97752C0.329075 1.89197 0.231235 1.78445 0.15698 1.66111C0.0827245 1.53777 0.033508 1.40102 0.0121402 1.25868C-0.031014 0.971193 0.0418855 0.678356 0.214802 0.444584C0.387718 0.210811 0.646486 0.0552534 0.934181 0.0121312C1.22188 -0.0309911 1.51493 0.0418545 1.74888 0.214643L10 6.29712L18.2511 0.214643C18.367 0.129087 18.4985 0.0671675 18.6383 0.0324205C18.7781 -0.00232646 18.9234 -0.00922079 19.0658 0.0121312C19.2083 0.0334832 19.3451 0.0826633 19.4685 0.156864C19.592 0.231064 19.6996 0.328831 19.7852 0.444584C19.8708 0.560336 19.9328 0.691806 19.9676 0.831488C20.0023 0.97117 20.0092 1.11633 19.9879 1.25868C19.9665 1.40102 19.9173 1.53777 19.843 1.66111C19.7688 1.78445 19.6709 1.89197 19.5551 1.97752L10.652 8.54726C10.4631 8.68634 10.2346 8.76118 10 8.76077Z"
                    fill="#7AE229"
                  />
                  <path
                    d="M10 14.5093C9.7654 14.5097 9.53687 14.4349 9.34802 14.2958L0.444913 7.72606C0.210967 7.55327 0.0552944 7.29469 0.0121402 7.00721C-0.031014 6.71973 0.0418855 6.42689 0.214802 6.19312C0.387718 5.95935 0.646486 5.80379 0.934181 5.76067C1.22188 5.71754 1.51493 5.79039 1.74888 5.96318L10 12.0457L18.2511 5.96318C18.4851 5.79039 18.7781 5.71754 19.0658 5.76067C19.3535 5.80379 19.6123 5.95935 19.7852 6.19312C19.9581 6.42689 20.031 6.71973 19.9879 7.00721C19.9447 7.29469 19.789 7.55327 19.5551 7.72606L10.652 14.2958C10.4631 14.4349 10.2346 14.5097 10 14.5093Z"
                  />
                </svg>
              </label>
            </div>
          </div>
        </fieldset>

        <div class="form-field form-field--assigned">
          <label for="assigned-to">Assigned to</label>

          <div class="contact-dropdown">
            <div class="contact-search">
              <input
                class="form-control"
                id="assigned-to"
                type="text"
                placeholder="Select contacts to assign"
                autocomplete="off"
                aria-controls="contact_list"
                aria-expanded="false"
                onclick="toggleAssignedContacts()"
              />
              <img
                class="dropdown-arrow"
                src="../assets/icons/drop-arrow.svg"
                alt=""
              />
            </div>

            <ul id="contact_list" class="contact-list" hidden></ul>
          </div>

          <div
            id="selected-contact-badges"
            class="selected-contact-badges"
          ></div>
        </div>

        <div class="form-field form-field--category">
          <label class="required-label" for="category">Category</label>
          <select
          class="form-control form-control--select"
          name="category"
          id="category"
          required
         >
       <option
         class="select-placeholder"
         value=""
         disabled
         ${getCategoryPlaceholderAttribute(category)}
         >
        Select task category
       </option>
       <option
         value="technical-task"
         ${getSelectedAttribute(category, "Technical Task")}
         >
         Technical Task
       </option>
       <option
         value="user-story"
         ${getSelectedAttribute(category, "User Story")}
         >
         User Story
       </option>
     </select>
        </div>

        <div class="form-field form-field--subtasks">
          <label for="subtask">Subtasks</label>

          <div class="subtask-input">
            <input
              id="subtask"
              type="text"
              placeholder="Add new subtask"
              oninput="updateSubtaskActions()"
              onkeydown="handleSubtaskKeydown(event)"
            />

            <div id="subtask-actions" class="subtask-actions" hidden>
              <button
                type="button"
                aria-label="Discard subtask input"
                onclick="clearSubtaskInput()"
              >✕</button>
              <button
                type="button"
                aria-label="Confirm subtask"
                onclick="saveSubtask()"
              >✓</button>
            </div>
          </div>

          <ul class="subtask-list" id="subtask-list"></ul>
        </div>
      </div>

      <span class="required-hint required-hint--mobile">
        <span class="required-marker" aria-hidden="true">*</span>
        This field is required
      </span>
    </div>
  `;
}


function getTaskActionsTemplate() {
  return /*html*/ `
    <div class="form-actions">
      <span class="required-hint required-hint--desktop">
        <span class="required-marker" aria-hidden="true">*</span>
        This field is required
      </span>

      <button type="reset" class="form-action form-action--clear">
        Clear
      </button>

      <button type="submit" class="form-action form-action--create">
        Create Task
      </button>
    </div>
  `;
}


function getTaskOverlayActionsTemplate(mode = "add", cancelHandler = "") {
  return /*html*/ `
    <div class="form-actions">
      ${
        mode === "edit"
          ? ""
          : `
        <button type="button" class="form-action form-action--clear"
          onclick="${cancelHandler}">Cancel ✕</button>
      `
      }
      <button type="submit" class="form-action form-action--create">
        ${mode === "edit" ? "Ok ✓" : "Create Task ✓"}
      </button>
    </div>
  `;
}


function getAssignedContactTemplate() {
  return /*html*/ `
    <label class="assigned-contact-option">
      <span class="selected-contact-badge" aria-hidden="true"></span>
      <span class="assigned-contact-name"></span>
      <input
        type="checkbox"
        name="assignedTo"
        onclick="renderSelectedContactBadges()"
      />
    </label>
  `;
}


function getSubtaskTemplate(index, isEditing) {
  return /*html*/ `
    <div class="subtask-row ${isEditing ? "subtask-row--editing" : ""}">
      ${
        isEditing
          ? `<input class="subtask-edit-input" type="text"
              aria-label="Edit subtask"
              oninput="editingSubtask.text = this.value"
              onkeydown="handleSubtaskEditKeydown(event)" />`
          : `<span class="subtask-text"></span>`
      }

      <div class="subtask-row-actions">
        ${
          isEditing
            ? ""
            : `<button type="button" aria-label="Edit subtask"
                onclick="editSubtask(${index})">
                <img src="../assets/icons/subtasks.svg" alt="" width="20" height="20" />
              </button>`
        }

        <button type="button" aria-label="Delete subtask"
          onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete.svg" alt="" width="20" height="20" />
        </button>

        ${
          isEditing
            ? `<button type="button" aria-label="Save subtask"
                onclick="saveSubtaskEdit()">✓</button>`
            : ""
        }
      </div>
    </div>
  `;
}
