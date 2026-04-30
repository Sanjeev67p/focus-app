const form = document.getElementById("task-form");
const input = document.getElementById("task-name");
const list = document.getElementById("task-list");

const startStopBtn = document.getElementById("start-stop");
const deleteBtn = document.getElementById("delete");
const selectedLabel = document.getElementById("selected");

let tasks = [];
let selected = null;
let interval = null;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function render() {
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.textContent = `${task.name} (${formatTime(task.time)})`;

    if (task === selected) {
      li.classList.add("selected");
    }

    li.onclick = () => {
      selected = task;
      updateUI();
      render();
    };

    list.appendChild(li);
  });
}

function updateUI() {
  if (!selected) {
    selectedLabel.textContent = "No task selected";
    startStopBtn.disabled = true;
    deleteBtn.disabled = true;
    return;
  }

  selectedLabel.textContent = selected.name;
  startStopBtn.disabled = false;
  deleteBtn.disabled = false;
  startStopBtn.textContent = selected.running ? "Pause" : "Start";
}

form.onsubmit = (e) => {
  e.preventDefault();

  const task = {
    name: input.value,
    time: 0,
    running: false
  };

  tasks.push(task);
  selected = task;

  input.value = "";

  render();
  updateUI();
};

startStopBtn.onclick = () => {
  if (!selected) return;

  if (selected.running) {
    clearInterval(interval);
    selected.running = false;
  } else {
    clearInterval(interval);

    selected.running = true;
    interval = setInterval(() => {
      selected.time++;
      render();
    }, 1000);
  }

  updateUI();
};

deleteBtn.onclick = () => {
  if (!selected) return;

  clearInterval(interval);

  tasks = tasks.filter(t => t !== selected);
  selected = null;

  render();
  updateUI();
};

updateUI();