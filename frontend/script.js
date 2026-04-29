const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const activeTasksList = document.getElementById("active-tasks-list");
const completedTasksList = document.getElementById("completed-tasks-list");

const centralStartStop = document.getElementById("central-start-stop");
const completeTaskButton = document.getElementById("complete-task-button");
const deleteTaskButton = document.getElementById("delete-task-button");
const selectedTaskLabel = document.getElementById("selected-task-label");
const statusEl = document.getElementById("status");

const totalTasksEl = document.getElementById("total-tasks");
const activeTasksCountEl = document.getElementById("active-tasks-count");
const completedTasksCountEl = document.getElementById("completed-tasks-count");
const totalTimeEl = document.getElementById("total-time");

let tasks = [];
let selectedTask = null;
let currentRunningTask = null;
let taskIdCounter = 0;

function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function updateDashboard() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const activeTasks = totalTasks - completedTasks;
  const totalSeconds = tasks.reduce((sum, task) => sum + task.seconds, 0);

  totalTasksEl.textContent = totalTasks;
  activeTasksCountEl.textContent = activeTasks;
  completedTasksCountEl.textContent = completedTasks;
  totalTimeEl.textContent = formatTime(totalSeconds);
}

function updateSelectedTaskUI() {
  const hasSelection = Boolean(selectedTask);

  if (!hasSelection) {
    selectedTaskLabel.textContent = "No task selected";
    centralStartStop.textContent = "Start";
    centralStartStop.disabled = true;
    completeTaskButton.disabled = true;
    deleteTaskButton.disabled = true;
    return;
  }

  const stateText = selectedTask.isCompleted
    ? "completed"
    : selectedTask.isRunning
      ? "running"
      : "paused";

  selectedTaskLabel.textContent = `Selected task: ${selectedTask.name} (${stateText})`;

  const canStartStop = !selectedTask.isCompleted;
  centralStartStop.disabled = !canStartStop;
  completeTaskButton.disabled = selectedTask.isCompleted;
  deleteTaskButton.disabled = false;
  centralStartStop.textContent = selectedTask.isRunning ? "Pause" : "Start";
}

function selectTask(task) {
  if (selectedTask) {
    selectedTask.li.classList.remove("selected");
  }

  selectedTask = task;

  if (selectedTask) {
    selectedTask.li.classList.add("selected");
  }

  updateSelectedTaskUI();
}

function selectLatestActiveTaskIfAvailable() {
  const latestActive = [...tasks].reverse().find(task => !task.isCompleted);
  if (latestActive) {
    selectTask(latestActive);
  } else {
    if (selectedTask) {
      selectedTask.li.classList.remove("selected");
    }
    selectedTask = null;
    updateSelectedTaskUI();
  }
}

function pauseTask(task) {
  if (!task || !task.isRunning) {
    return;
  }

  clearInterval(task.intervalId);
  task.intervalId = null;
  task.isRunning = false;

  if (currentRunningTask === task) {
    currentRunningTask = null;
  }

  updateSelectedTaskUI();
}

function startTask(task) {
  if (!task || task.isCompleted) {
    return;
  }

  if (currentRunningTask && currentRunningTask !== task) {
    pauseTask(currentRunningTask);
  }

  if (task.isRunning) {
    return;
  }

  task.isRunning = true;

  task.intervalId = setInterval(() => {
    task.seconds += 1;
    task.timer.textContent = formatTime(task.seconds);
    updateDashboard();
  }, 1000);

  currentRunningTask = task;
  updateSelectedTaskUI();
}

function completeTask(task) {
  if (!task || task.isCompleted) {
    return;
  }

  pauseTask(task);

  task.isCompleted = true;
  task.li.classList.remove("selected");
  task.li.classList.add("completed");

  completedTasksList.appendChild(task.li);

  if (selectedTask && selectedTask.id === task.id) {
    selectedTask = null;
  }

  setStatus(`Completed: ${task.name}`);
  selectLatestActiveTaskIfAvailable();
  updateDashboard();
}

function deleteTask(task) {
  if (!task) {
    return;
  }

  pauseTask(task);
  task.li.remove();

  tasks = tasks.filter(item => item.id !== task.id);

  if (selectedTask && selectedTask.id === task.id) {
    selectedTask = null;
  }

  setStatus(`Deleted: ${task.name}`);
  selectLatestActiveTaskIfAvailable();
  updateDashboard();
}

function createTask(taskName) {
  const id = ++taskIdCounter;

  const li = document.createElement("li");
  li.classList.add("task-item");
  li.setAttribute("data-task-id", id);
  li.tabIndex = 0;

  const nameSpan = document.createElement("span");
  nameSpan.classList.add("task-name");
  nameSpan.textContent = taskName;

  const meta = document.createElement("div");
  meta.classList.add("task-row-meta");

  const timerSpan = document.createElement("span");
  timerSpan.classList.add("task-time");
  timerSpan.textContent = "00:00:00";

  meta.appendChild(timerSpan);
  li.appendChild(nameSpan);
  li.appendChild(meta);

  const task = {
    id,
    name: taskName,
    li,
    timer: timerSpan,
    seconds: 0,
    intervalId: null,
    isRunning: false,
    isCompleted: false
  };

  li.addEventListener("click", function () {
    selectTask(task);
  });

  li.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectTask(task);
    }
  });

  tasks.push(task);
  activeTasksList.appendChild(li);

  setStatus(`Added: ${taskName}`);
  selectTask(task);
  updateDashboard();
}

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const taskName = taskNameInput.value.trim();

  if (taskName === "") {
    setStatus("Please enter a task name.");
    return;
  }

  createTask(taskName);
  taskNameInput.value = "";
  taskNameInput.focus();
});

centralStartStop.addEventListener("click", function () {
  if (!selectedTask) {
    const latestTask = [...tasks].reverse().find(task => !task.isCompleted);
    if (latestTask) {
      selectTask(latestTask);
    }
  }

  if (!selectedTask || selectedTask.isCompleted) {
    return;
  }

  if (selectedTask.isRunning) {
    pauseTask(selectedTask);
    setStatus(`Paused: ${selectedTask.name}`);
  } else {
    startTask(selectedTask);
    setStatus(`Started: ${selectedTask.name}`);
  }

  updateDashboard();
  updateSelectedTaskUI();
});

completeTaskButton.addEventListener("click", function () {
  if (!selectedTask || selectedTask.isCompleted) {
    return;
  }

  completeTask(selectedTask);
});

deleteTaskButton.addEventListener("click", function () {
  if (!selectedTask) {
    return;
  }

  const name = selectedTask.name;
  deleteTask(selectedTask);
  setStatus(`Deleted: ${name}`);
});

updateDashboard();
updateSelectedTaskUI();