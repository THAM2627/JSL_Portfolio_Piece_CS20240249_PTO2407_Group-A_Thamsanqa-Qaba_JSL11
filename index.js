// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('light-theme', 'enabled');
  }
  if (!localStorage.getItem('activeBoard') && initialData && initialData.length > 0 && initialData[0].board) {
    localStorage.setItem('activeBoard', JSON.stringify(initialData[0].board));
  } else if (!localStorage.getItem('activeBoard')) {
    localStorage.setItem('activeBoard', JSON.stringify({ /* default board data */ }));
  }
  console.log('Data initialization complete.');
}

// TASK: Get elements from the DOM
const elements = {
  logo: document.getElementById('logo'),
  boardBtns: document.querySelectorAll('.board-btn'),
  dot: document.querySelectorAll('.dot'),
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  taskDivs: document.querySelectorAll('.task-div'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  editTaskModal: document.getElementById('edit-task-modal'),
  modalWindow: document.getElementById('modal-window'),
  filterDiv: document.getElementById('filter-div'),
  hideSideBarBtn: document.getElementById('hide-sidebar-btn'),
  showSideBarBtn: document.getElementById('show-sidebar-btn'),
  themeSwitch: document.getElementById('switch'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  createNewTaskBtn: document.getElementById('create-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  editTaskBtn: document.getElementById('edit-task-btn'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskHeader: document.getElementById('edit-task-header'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
  editBtnsDiv: document.getElementById('editBtnsDiv'),
  editBtns: document.querySelectorAll('.editBtns'),
  submitBtn: document.querySelectorAll('.submit-btn'),
  taskTitleInput: document.getElementById('task-title-input'),
  taskDescInput: document.getElementById('task-desc-input'),
  taskForm: document.getElementById('task-form'),
  selectStatus: document.getElementById('select-status'),
  taskHeader: document.getElementById('task-header'),
  taskDiv: document.getElementById('task-div'),
  taskTitle: document.getElementById('task-title'),
  taskDesc: document.getElementById('task-desc'),
  taskStatus: document.getElementById('task-status'),
  taskBoard: document.getElementById('task-board'),
  tasksContainer: document.getElementById('tasks-container'),
  columnHeadDiv: document.querySelectorAll('.column-head-div'),
  columnHeader: document.querySelectorAll('.columnHeader'),
  taskList: document.getElementById('.task-list'),
  taskTemplate: document.getElementById('task-template'),
  taskInput: document.getElementById('task-input'),
  taskDescriptionInput: document.getElementById('task-description-input'),
  taskPrioritySelect: document.getElementById('task-priority-select'),
  taskDueDateInput: document.getElementById('task-due-date-input'),
  taskStatusSelect: document.getElementById('task-status-select'),
}

let activeBoard = ""
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)

    });
    boardsContainer.appendChild(boardElement);
  });

};

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const elements = {
    columnDivs: document.querySelectorAll('.column-div'),
  }
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.forEach(task => {
      if (task.status === status) {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute('data-task-id', task.id);
        // Listen for a click event on each task and open a modal
        taskElement.addEventListener('click', () => {
          openEditTaskModal(task);
        });
        tasksContainer.appendChild(taskElement);
      }
    });
  });

}


filterAndDisplayTasksByBoard(activeBoard);

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {

    if (btn.textContent.toLowerCase() === boardName.toLowerCase()) {
      btn.classList.add('active')
    }
    else {
      btn.remove('active');
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild();

  return;
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });
  // Also hide the filter overlay

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);
  function setupEventListeners() {
    // Cancel editing task event listener
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  };

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });
  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  //validate user input
  const title = elements.titleInput.value.trim();
  if (!title) {
    console.error('Title is required.');
    return;
  }

  //Assign user input to the task object
  const task = {
    //title, description, status, board, 
    title: elements.titleInput.value,
    board: activeBoard

  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
  return;
}


function toggleSidebar(show) {
  //const sidebar/sidemenu, pull from DOM, queryselector, pull exisiting sidebar.
  const sidebar = document.querySelector('.side-bar');
  if (show) {
    sidebar.classList.add('show-sidebar');
    localStorage.setItem('showSideBar', 'show');
  } else {
    sidebar.classList.remove('show-sidebar');
    localStorage.setItem('showSideBar', 'hide');
  }
  //toggle between show and hide, use localstorage
  //if statments for show and hide
}

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  document.body.classList.toggle('dark-mode', newTheme === 'dark');
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;
  //title, description and status pulled from the GREAT DOM

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  // two btns: savechanges, deletetask, pulled from DOM; const, getElementbyID


  // Call saveTaskChanges upon click of Save Changes button
  saveTaskChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  //deletetaskbtn click, deleteTASK
  deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const title = document.getElementById('edit-task-title-input').value;
  const description = document.getElementById('edit-task-desc-input').value;
  const status = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    title,
    description,
    status,
  };

  // Update task using a hlper functoin
  patchTask(taskId, updatedTask);

  // PATCHTASK is the helper function, takes two values, 1.TaskID 2.updatedTask


  // Close the modal and refresh the UI to reflect the changes
  toggleModal()
  //call two functions: togglemodal, refreshTasksUI
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  elements.createNewTaskBtn = document.getElementById('create-new-task-btn');
  elements.filterDiv = document.getElementById('filterDiv');
  elements.modalWindow = document.getElementById('modal-window');
  elements.editTaskModal = document.getElementById('edit-task-modal');
  elements.columnDivs = document.querySelectorAll('.column-div');
  elements.cancelEditBtn = document.getElementById('cancel-edit-btn');

  console.log(elements.cancelEditBtn);


}

styleActiveBoard('My Board');