let currentUpdateId = null;


async function fetchMeals(query = 'chicken') {
    const searchTerm = document.getElementById('mealInput').value || query;
    const resultsDiv = document.getElementById('mealResults');
    resultsDiv.innerHTML = "<h3>Searching...</h3>";

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
        const data = await response.json();
        resultsDiv.innerHTML = "";

        if (data.meals) {
            data.meals.forEach(meal => {
                
                const isVeg = meal.strCategory === "Vegetarian";
                
                
                let ingredients = 0;
                for (let i = 1; i <= 20; i++) { if (meal[`strIngredient${i}`]) ingredients++; }
                const estCalories = 250 + (ingredients * 45);

                resultsDiv.innerHTML += `
                    <div class="card">
                        <img src="${meal.strMealThumb}" width="120" style="border-radius:10px">
                        <div>
                            <h3>${meal.strMeal} <span class="badge">${meal.strCategory}</span></h3>
                            <p><strong>Type:</strong> ${isVeg ? "🥗 Vegetarian" : "🍖 Standard"}</p>
                            <p><strong>Est. Calories:</strong> ${estCalories} kcal</p>
                            <button class="btn btn-add" onclick="createPlan('${meal.strMeal}', '${meal.strCategory}')">Add to Planner</button>
                        </div>
                    </div>`;
            });
        }
    } catch (error) {
        resultsDiv.innerHTML = "<p>Internet Connection Error. Please try again.</p>";
    }
}

//  CREATE PROCESS (CRUD) 
function createPlan(name, cat) {
    let plans = JSON.parse(localStorage.getItem('myMeals')) || [];
    plans.push({ id: Date.now(), name: name, category: cat, day: "Not Assigned" });
    localStorage.setItem('myMeals', JSON.stringify(plans));
    alert("Success: " + name + " added to your planner!"); 
}

//  READ PROCESS (CRUD) 
function loadPlanner() {
    const display = document.getElementById('savedMeals');
    const plans = JSON.parse(localStorage.getItem('myMeals')) || [];
    display.innerHTML = (plans.length === 0) ? "<h3>No meals saved yet.</h3>" : "";

    plans.forEach(item => {
        display.innerHTML += `
            <div class="card">
                <div style="flex-grow:1">
                    <h3>${item.name}</h3>
                    <p>Cooking Day: <strong>${item.day}</strong></p>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn btn-update" onclick="openUpdateModal(${item.id})">Edit Day</button>
                    <button class="btn btn-delete" onclick="deletePlan(${item.id})">Remove</button>
                </div>
            </div>`;
    });
}

// UPDATE PROCESS (CRUD) 
function openUpdateModal(id) {
    currentUpdateId = id;
    document.getElementById('updateModal').style.display = 'block';
    document.getElementById('newDayInput').value = "";
}

document.getElementById('saveUpdateBtn').onclick = function() {
    const newDay = document.getElementById('newDayInput').value.trim();
    if (newDay !== "") {
        let plans = JSON.parse(localStorage.getItem('myMeals')) || [];
        const index = plans.findIndex(p => p.id === Number(currentUpdateId));
        
        if (index !== -1) {
            plans[index].day = newDay;
            localStorage.setItem('myMeals', JSON.stringify(plans));
            alert("Success: Update successful!"); 
            document.getElementById('updateModal').style.display = 'none';
            loadPlanner();
        }
    }
};

// DELETE PROCESS (CRUD) 
function deletePlan(id) {
    if(confirm("Remove this meal?")) {
        let plans = JSON.parse(localStorage.getItem('myMeals'));
        plans = plans.filter(p => p.id !== Number(id));
        localStorage.setItem('myMeals', JSON.stringify(plans));
        alert("Item removed.");
        loadPlanner();
    }
}


window.onload = () => {
    if (document.getElementById('mealResults')) fetchMeals();
    if (document.getElementById('savedMeals')) loadPlanner();
};