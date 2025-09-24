let allMealsByDate = {};
let dateList = [];
let currentDateIndex = 0;
let editingMealId = null;

const renderMealsTable = (date) => {
  const mealList = document.getElementById("mealsTableBody");
  mealList.innerHTML = "";
  const mealsForDate =
    (allMealsByDate[date] && allMealsByDate[date].meals) || [];
  mealsForDate.forEach((meal) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${meal.date || ""}</td>
      <td>${meal.meal || ""}</td>
      <td>${meal.foodName || ""}</td>
      <td>${meal.quantity || ""}</td>
      <td>${meal.unit || ""}</td>
      <td>${meal.calories || ""}</td>
      <td>
        <button class="edit-btn" data-id="${meal.id}">Edit</button>
        <button class="delete-btn" data-id="${meal.id}">Delete</button>
      </td>
    `;
    mealList.appendChild(row);
  });

  // Show total calories for the day
  const tfoot = document.querySelector("#mealsTable tfoot");
  if (tfoot) tfoot.remove();
  const table = document.getElementById("mealsTable");
  const foot = document.createElement("tfoot");
  foot.innerHTML = `<tr><td colspan="5"><b>Total Calories</b></td><td colspan="2">${(allMealsByDate[date] && allMealsByDate[date].totalCalories) || 0}</td></tr>`;
  table.appendChild(foot);

  // Add event listeners for edit/delete
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = () => startEditMeal(btn.dataset.id, date);
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = () => deleteMeal(btn.dataset.id);
  });
};

const updateDateNav = () => {
  const navDiv = document.getElementById("dateNav");
  if (!navDiv) return;
  let label = navDiv.querySelector("#dateNavLabel");
  if (!label) {
    label = document.createElement("span");
    label.id = "dateNavLabel";
    navDiv.insertBefore(label, navDiv.children[1] || null);
  }
  label.style.fontSize = "2rem";
  label.style.color = "white";
  label.style.fontWeight = "bold";
  if (dateList.length === 0) {
    label.textContent = "No meals yet";
  } else {
    label.textContent = dateList[currentDateIndex];
  }
};

const fetchAndRenderMeals = async (selectDate) => {
  const response = await fetch("/meals", { method: "GET" });
  allMealsByDate = await response.json();
  dateList = Object.keys(allMealsByDate).sort();
  if (dateList.length === 0) {
    currentDateIndex = 0;
    renderMealsTable("");
    updateDateNav();
    return;
  }
  let today = new Date().toISOString().split("T")[0];
  if (selectDate && dateList.includes(selectDate)) {
    currentDateIndex = dateList.indexOf(selectDate);
  } else if (dateList.includes(today)) {
    currentDateIndex = dateList.indexOf(today);
  } else if (currentDateIndex >= dateList.length) {
    currentDateIndex = 0;
  }
  updateDateNav();
  renderMealsTable(dateList[currentDateIndex]);
};

const submit = async function (event) {
  event.preventDefault();
  const form = document.querySelector("form");
  let formData = new FormData(form);
  let data = Object.fromEntries(formData.entries());

  if (
    !data.meal ||
    !data.foodName ||
    !data.quantity ||
    !data.unit ||
    !data.calories
  ) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  if (editingMealId) {
    data.id = editingMealId;
    await fetch("/update", {
      method: "POST",
      body: JSON.stringify(data),
    });
    editingMealId = null;
    form.reset();
    document.getElementById("submitBtn").textContent = "Submit";
  } else {
    await fetch("/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    form.reset();
  }
  fetchAndRenderMeals(data.date);
};

const deleteMeal = async (id) => {
  await fetch("/delete", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  fetchAndRenderMeals(dateList[currentDateIndex]);
};

const startEditMeal = (id, date) => {
  const meal =
    allMealsByDate[date] && allMealsByDate[date].meals.find((m) => m.id === id);
  if (!meal) return;
  editingMealId = id;
  const form = document.querySelector("form");
  form.meal.value = meal.meal;
  form.foodName.value = meal.foodName;
  form.quantity.value = meal.quantity;
  form.unit.value = meal.unit;
  form.calories.value = meal.calories;
  if (form.date) form.date.value = meal.date;
  document.getElementById("submitBtn").textContent = "Update";
};

const prevDate = () => {
  if (dateList.length === 0) return;
  currentDateIndex = (currentDateIndex - 1 + dateList.length) % dateList.length;
  updateDateNav();
  renderMealsTable(dateList[currentDateIndex]);
};

const nextDate = () => {
  if (dateList.length === 0) return;
  currentDateIndex = (currentDateIndex + 1) % dateList.length;
  updateDateNav();
  renderMealsTable(dateList[currentDateIndex]);
};

const viewMeals = async function () {
  const response = await fetch("/meals", {
    method: "GET",
  });

  const meals = await response.json();
  console.log("meals:", meals);

  const mealList = document.getElementById("mealsTableBody");
  mealList.innerHTML = "";
  meals.forEach((meal) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${meal.date || ""}</td>
      <td>${meal.meal || ""}</td>
      <td>${meal.foodName || ""}</td>
      <td>${meal.quantity || ""}</td>
      <td>${meal.unit || ""}</td>
      <td>${meal.calories || ""}</td>
    `;
    mealList.appendChild(row);
  });
};

window.onload = function () {
  // Add submit button id for update
  const submitBtn =
    document.querySelector("form button[type='submit']") ||
    document.querySelector("form button");
  submitBtn.id = "submitBtn";
  submitBtn.onclick = submit;

  const form = document.querySelector("form");
  const clearButton = document.getElementById("clearButton");
  clearButton.onclick = function () {
    form.reset();
    editingMealId = null;
    document.getElementById("submitBtn").textContent = "Submit";
  };

  // Date navigation
  let navDiv = document.getElementById("dateNav");
  if (!navDiv) {
    navDiv = document.createElement("div");
    navDiv.id = "dateNav";
    navDiv.style.display = "flex";
    navDiv.style.alignItems = "center";
    navDiv.style.justifyContent = "center";
    navDiv.style.gap = "10px";
    const tableContainer = document.querySelector(".table-container");
    tableContainer.insertBefore(navDiv, tableContainer.firstChild);
    navDiv.innerHTML = `<button id="prevDateBtn">&#8592;</button><span id="dateNavLabel"></span><button id="nextDateBtn">&#8594;</button>`;
    document.getElementById("prevDateBtn").onclick = prevDate;
    document.getElementById("nextDateBtn").onclick = nextDate;
    navDiv.appendChild(document.createElement("br"));
  }
  updateDateNav();
  fetchAndRenderMeals();
};
