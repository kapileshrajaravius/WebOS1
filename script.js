function dragElement(element) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;

  if (document.getElementById(element.id + "header")) {
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = moveElement;
  }

  function moveElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + "px";
    element.style.left = (element.offsetLeft - currentX) + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

var biggestIndex = 1;
var topBar = document.querySelector("#top");

function openWindow(element) {
  element.style.display = "flex";
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;
}

function closeWindow(element) {
  element.style.display = "none";
}

function handleWindowTap(element) {
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;
}

function addWindowTapHandling(element) {
  element.addEventListener("mousedown", function () {
    handleWindowTap(element);
  });
}

function initializeWindow(id) {
  var element = document.getElementById(id);
  dragElement(element);
  addWindowTapHandling(element);
  return element;
}

function minimizeWindow(element, label) {
  element.style.display = "none";

  var taskbarItem = document.createElement("div");
  taskbarItem.className = "taskbaritem";
  taskbarItem.innerText = label;
  taskbarItem.id = "taskbar-" + element.id;

  taskbarItem.addEventListener("click", function () {
    openWindow(element);
    taskbarItem.remove();
  });

  document.querySelector("#taskbar").appendChild(taskbarItem);
}

function addMinimizeHandling(windowId, label) {
  var button = document.querySelector("#" + windowId + "minimize");
  var element = document.getElementById(windowId);
  button.addEventListener("click", function () {
    minimizeWindow(element, label);
  });
}

function makeResizable(windowId) {
  var element = document.getElementById(windowId);
  var handle = document.getElementById(windowId + "resize");

  var minWidth = 180;
  var minHeight = 120;
  var maxWidth = 700;
  var maxHeight = 600;

  handle.addEventListener("mousedown", function (e) {
    e.preventDefault();
    e.stopPropagation();

    var startWidth = element.offsetWidth;
    var startHeight = element.offsetHeight;
    var startX = e.clientX;
    var startY = e.clientY;

    function doResize(e) {
      var newWidth = startWidth + (e.clientX - startX);
      var newHeight = startHeight + (e.clientY - startY);

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      element.style.width = newWidth + "px";
      element.style.height = newHeight + "px";
    }

    function stopResize() {
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    }

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  });
}

var selectedIcon = undefined;

function selectIcon(element) {
  if (selectedIcon) {
    deselectIcon(selectedIcon);
  }
  element.classList.add("selected");
  selectedIcon = element;
}

function deselectIcon(element) {
  element.classList.remove("selected");
  selectedIcon = undefined;
}

function handleIconTap(element) {
  if (element.classList.contains("selected")) {
    deselectIcon(element);
  } else {
    selectIcon(element);
  }
}

var welcomeScreen = initializeWindow("welcome");
var welcomeScreenClose = document.querySelector("#welcomeclose");
welcomeScreenClose.addEventListener("click", function () {
  closeWindow(welcomeScreen);
});
addMinimizeHandling("welcome", "CleanOS");
makeResizable("welcome");

var notesScreen = initializeWindow("notes");
var notesScreenClose = document.querySelector("#notesclose");
notesScreenClose.addEventListener("click", function () {
  closeWindow(notesScreen);
});
addMinimizeHandling("notes", "Notes");
makeResizable("notes");

var notesIcon = document.querySelector("#notesicon");
notesIcon.addEventListener("click", function () {
  handleIconTap(notesIcon);
  openWindow(notesScreen);
});

var content = [
  {
    title: "Welcome",
    date: "09/11/2026",
    content: `<p>this is the first note. click the + button to make a new one.</p>`
  },
  {
    title: "Second Note",
    date: "09/11/2026",
    content: `<p>add whatever you want here, its just html inside a string.</p>`
  }
];

var currentNoteIndex = 0;
var noteContentDiv = document.querySelector("#noteContent");

function setNoteContent(index) {
  currentNoteIndex = index;
  noteContentDiv.innerHTML = content[index].content;
  renderSidebar();
}

noteContentDiv.addEventListener("input", function () {
  content[currentNoteIndex].content = noteContentDiv.innerHTML;
});

function renderSidebar() {
  var sidebar = document.querySelector("#sidebar");
  sidebar.innerHTML = "";

  for (var i = 0; i < content.length; i++) {
    (function (index) {
      var note = content[index];

      var newDiv = document.createElement("div");
      newDiv.className = "sidebarnote" + (index === currentNoteIndex ? " active" : "");
      newDiv.innerHTML = `
        <p style="margin: 0px; font-weight: 500;">${note.title}</p>
        <p style="margin: 0px; font-size: 12px; color: #666;">${note.date}</p>
      `;

      newDiv.addEventListener("click", function () {
        setNoteContent(index);
      });

      sidebar.appendChild(newDiv);
    })(i);
  }
}

function getTodayString() {
  var today = new Date();
  return (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
}

var newNoteButton = document.querySelector("#newNoteButton");
newNoteButton.addEventListener("click", function () {
  content.push({
    title: "New Note",
    date: getTodayString(),
    content: `<p>write something here...</p>`
  });
  setNoteContent(content.length - 1);
  noteContentDiv.focus();
});

renderSidebar();
setNoteContent(0);

var todoScreen = initializeWindow("todo");
var todoScreenClose = document.querySelector("#todoclose");
todoScreenClose.addEventListener("click", function () {
  closeWindow(todoScreen);
});
addMinimizeHandling("todo", "To-Do");
makeResizable("todo");

var todoIcon = document.querySelector("#todoicon");
todoIcon.addEventListener("click", function () {
  handleIconTap(todoIcon);
  openWindow(todoScreen);
});

var tasks = [];

function renderTodoList() {
  var listDiv = document.querySelector("#todoList");
  listDiv.innerHTML = "";

  for (var i = 0; i < tasks.length; i++) {
    (function (index) {
      var task = tasks[index];

      var itemDiv = document.createElement("div");
      itemDiv.className = "todoitem" + (task.done ? " done" : "");

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", function () {
        tasks[index].done = checkbox.checked;
        renderTodoList();
      });

      var text = document.createElement("p");
      text.innerText = task.text;

      var remove = document.createElement("span");
      remove.className = "todoremove";
      remove.innerText = "✕";
      remove.addEventListener("click", function () {
        tasks.splice(index, 1);
        renderTodoList();
      });

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(text);
      itemDiv.appendChild(remove);
      listDiv.appendChild(itemDiv);
    })(i);
  }
}

var todoInput = document.querySelector("#todoInput");
var todoAddButton = document.querySelector("#todoAddButton");

function addTask() {
  var value = todoInput.value.trim();
  if (value === "") {
    return;
  }
  tasks.push({ text: value, done: false });
  todoInput.value = "";
  renderTodoList();
}

todoAddButton.addEventListener("click", addTask);
todoInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

var calculatorScreen = initializeWindow("calculator");
var calculatorScreenClose = document.querySelector("#calculatorclose");
calculatorScreenClose.addEventListener("click", function () {
  closeWindow(calculatorScreen);
});
addMinimizeHandling("calculator", "Calculator");
makeResizable("calculator");

var calcIcon = document.querySelector("#calcicon");
calcIcon.addEventListener("click", function () {
  handleIconTap(calcIcon);
  openWindow(calculatorScreen);
});

var calcDisplay = document.querySelector("#calcDisplay");
var calcExpression = "";

function updateCalcDisplay() {
  calcDisplay.innerText = calcExpression === "" ? "0" : calcExpression;
}

var calcButtons = document.querySelectorAll(".calcbtn");
for (var k = 0; k < calcButtons.length; k++) {
  calcButtons[k].addEventListener("click", function () {
    var value = this.getAttribute("data-value");
    var action = this.getAttribute("data-action");

    if (action === "clear") {
      calcExpression = "";
    } else if (action === "delete") {
      calcExpression = calcExpression.slice(0, -1);
    } else if (action === "equals") {
      try {
        calcExpression = String(eval(calcExpression));
      } catch (err) {
        calcExpression = "error";
      }
    } else if (value) {
      calcExpression += value;
    }

    updateCalcDisplay();
  });
}

var weatherScreen = initializeWindow("weather");
var weatherScreenClose = document.querySelector("#weatherclose");
weatherScreenClose.addEventListener("click", function () {
  closeWindow(weatherScreen);
});
addMinimizeHandling("weather", "Weather");
makeResizable("weather");

var weatherIcon = document.querySelector("#weathericon");
weatherIcon.addEventListener("click", function () {
  handleIconTap(weatherIcon);
  openWindow(weatherScreen);
});

var weatherInput = document.querySelector("#weatherInput");
var weatherSearchButton = document.querySelector("#weatherSearchButton");
var weatherResult = document.querySelector("#weatherResult");

function weatherCodeToText(code) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

async function searchWeather() {
  var city = weatherInput.value.trim();
  if (city === "") {
    return;
  }

  weatherResult.innerHTML = "<p style='color: #999; font-size: 14px;'>loading...</p>";

  try {
    var geoResponse = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1");
    var geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherResult.innerHTML = "<p style='color: #999; font-size: 14px;'>city not found</p>";
      return;
    }

    var place = geoData.results[0];

    var weatherResponse = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude + "&longitude=" + place.longitude + "&current=temperature_2m,weather_code");
    var weatherData = await weatherResponse.json();

    var temp = Math.round(weatherData.current.temperature_2m);
    var condition = weatherCodeToText(weatherData.current.weather_code);

    weatherResult.innerHTML = `
      <p style="margin: 0; font-size: 14px; color: #666;">${place.name}, ${place.country}</p>
      <p style="margin: 8px 0; font-size: 36px; font-weight: 600;">${temp}°C</p>
      <p style="margin: 0; font-size: 14px;">${condition}</p>
    `;
  } catch (err) {
    weatherResult.innerHTML = "<p style='color: #999; font-size: 14px;'>failed to fetch weather</p>";
  }
}

weatherSearchButton.addEventListener("click", searchWeather);
weatherInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchWeather();
  }
});

function updateTime() {
  var currentTime = new Date().toLocaleString();
  var timeText = document.querySelector("#timeElement");
  timeText.innerHTML = currentTime;
}
setInterval(updateTime, 1000);
updateTime();