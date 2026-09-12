function generateSummaryHTM(statusCounts, tasks, urgentTasks) {
  return /* html */ `
  
          <li
            class="summary-card summary-card--todo"
            onmouseenter="changeFillIcon(this, 'start')"
            onmouseleave="changeFillIcon(this, 'end')"
          >
            <a
              class="summary-card__link"
              href="../html/board.html"
              aria-label="Open board"
            ></a>

            <svg
              class="summary-card-icon"
              viewBox="0 0 69 69"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                class="icon_circle"
                cx="34.5"
                cy="34.5"
                r="34.5"
                fill="#2A3647"
              />
              <mask
                id="mask0_62_577"
                style="mask-type: alpha"
                maskUnits="userSpaceOnUse"
                x="18"
                y="18"
                width="33"
                height="33"
              >
                <rect x="18.5" y="18.5" width="32" height="32" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_62_577)">
                <path
                  class="icon_motif"
                  d="M25.1667 43.8334H27.0333L38.5333 32.3334L36.6667 30.4667L25.1667 41.9667V43.8334ZM44.2333 30.4001L38.5667 24.8001L40.4333 22.9334C40.9444 22.4223 41.5722 22.1667 42.3167 22.1667C43.0611 22.1667 43.6889 22.4223 44.2 22.9334L46.0667 24.8001C46.5778 25.3112 46.8444 25.9279 46.8667 26.6501C46.8889 27.3723 46.6444 27.989 46.1333 28.5001L44.2333 30.4001ZM42.3 32.3667L28.1667 46.5001H22.5V40.8334L36.6333 26.7001L42.3 32.3667Z"
                  fill="white"
                />
              </g>
            </svg>
            <span class="summary-card-number card-number">${statusCounts.toDo}</span>
            <span class="summary-card-label label-todo">To-Do</span>
          </li>

          <li
            class="summary-card summary-card--done"
            onmouseenter="changeStrokeIcon(this, 'start')"
            onmouseleave="changeStrokeIcon(this, 'end')"
          >
            <a
              class="summary-card__link"
              href="./board.html"
              aria-label="Open board"
            ></a>
            <svg
              class="summary-card-icon"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                class="icon_circle"
                cx="20"
                cy="20"
                r="20"
                fill="#2A3647"
              />
              <path
                class="icon_motif"
                d="M11.3203 20.0001L17.8297 26.4151L28.6788 13.585"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="summary-card-number card-number">${statusCounts.done}</span>
            <span class="summary-card-label label-done">Done</span>
          </li>

          <li class="summary-card summary-card--date">
            <a
              class="summary-card__link"
              href="./board.html"
              aria-label="Open board"
            ></a>
            <div class="summary-card--urgent">
              <img
                class="summary-card-icon"
                src="../assets/icons/urgent-icon.svg"
                alt=""
              />
              <span class="summary-card-number card-number">${urgentTasks}</span>
              <span class="summary-card-label label-urgent">Urgent</span>
            </div>

            <div class="summary-card-deadline">
              <time class="card-date" datetime="2026-10-16"
                >October 16, 2026</time
              >
              <span class="summary-card-deadline-label">Upcoming Deadline</span>
            </div>
          </li>

          <li class="summary-card summary-card--small summary-card--board">
            <a
              class="summary-card__link"
              href="./board.html"
              aria-label="Open board"
            ></a>
            <span class="summary-card-number">${tasks.length}</span>
            <span class="summary-card-label"
              >Task in <br />
              Board</span
            >
          </li>

          <li class="summary-card summary-card--small summary-card--progress">
            <a
              class="summary-card__link"
              href="./board.html"
              aria-label="Open board"
            ></a>
            <span class="summary-card-number">${statusCounts.inProgress}</span>
            <span class="summary-card-label">Task in Progress</span>
          </li>

          <li class="summary-card summary-card--small summary-card--feedback">
            <a
              class="summary-card__link"
              href="./board.html"
              aria-label="Open board"
            ></a>
            <span class="summary-card-number">${statusCounts.awaitFeedback}</span>
            <span class="summary-card-label">Awaiting feedback</span>
          </li>
       
  `;
}
