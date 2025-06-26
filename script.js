const display = document.getElementById('display');
display.focus();

    // Keep the display focused
document.addEventListener('click', (event) => {
if (event.target !== display || !display.contains(event.target)) {
      display.focus();
    }
});

    // Function to switch between Radian and Degree
let isDegreeMode = false; // Radian mode by default

function switchRadianAndDegree() {
    const switchRD = document.querySelector('.degRad');
    const switchRDbutton = document.querySelector('.switchDEGandRAD');

    isDegreeMode = !isDegreeMode;
    if (isDegreeMode) {
        switchRD.innerHTML = 'Deg';
        switchRDbutton.innerHTML = 'Rad';
    } else {
        switchRD.innerHTML = 'Rad';
        switchRDbutton.innerHTML = 'Deg';
    }
}

    // Function to clear the display
function clearDisplay() {
    display.value = '';
    display.focus();
}

    // Function to handle backspace
function backspace() {
    display.value = display.value.slice(0, -1);
    display.focus();
}

function addToDisplay(value) {
    const display = document.getElementById('display');

    // Exclude specific buttons
    if (value === "C" || value === "Deg" || value === "Rad" || value === "=") {
        return; // Do nothing for these buttons
    }

    // Append the value to the display
    display.value += value;
}

function addEPowerX() {
    const display = document.getElementById('display');
    display.value += 'e^'; // Append 'e^' to the display
}

function addSquare() {
    const display = document.getElementById('display');
    display.value += '**2'; // Append '**2' to the display for squaring
}

function addFactorial() {
    const display = document.getElementById('display');
    const currentValue = display.value;

    // Check if the last character is already a factorial symbol (!)
    if (currentValue.endsWith('!')) {
        return; // Do nothing if factorial is already added
    }

    // Append the factorial symbol (!) to the display
    display.value += '!';
}

function addPower() {
    const display = document.getElementById('display');
    display.value += "**"; // Append '^' to the display for exponentiation
}

function addAbsoluteValue() {
    const display = document.getElementById('display');
    display.value = `|${display.value}|`; // Wrap the current value in absolute bars
}

function addPi() {
    const display = document.getElementById('display');
    display.value += "π"; // Append 'π' to the display
}

function addSinInverse() {
    const display = document.getElementById('display');
    display.value += "sin⁻¹("; // Append 'sin⁻¹(' to the display
}

function addCosInverse() {
    const display = document.getElementById('display');
    display.value += "cos⁻¹("; // Append 'cos⁻¹(' to the display
}

function addTanInverse() {
    const display = document.getElementById('display');
    display.value += "tan⁻¹("; // Append 'tan⁻¹(' to the display
}

async function calculateResult() {
    const display = document.getElementById('display');
    let expression = display.value;

    try {
        // Convert degrees to radians for trig functions if in degree mode
        if (isDegreeMode) {
            expression = expression
                .replace(/sin\(([^)]+)\)/g, (_, x) => `sin(${x}*Math.PI/180)`)
                .replace(/cos\(([^)]+)\)/g, (_, x) => `cos(${x}*Math.PI/180)`)
                .replace(/tan\(([^)]+)\)/g, (_, x) => `tan(${x}*Math.PI/180)`);
        }

        // Ensure expression is properly formatted before sending to Flask
        expression = expression
            .replace(/√\(([^)]+)\)/g, "sqrt($1)")
            .replace(/∛\(([^)]+)\)/g, "cbrt($1)")
            .replace(/\|([^\|]+)\|/g, "abs($1)")
            .replace(/log\(([^)]+)\)/g, "log10($1)")
            .replace(/ln\(([^)]+)\)/g, "log($1)")
            .replace(/pi/g, "Math.PI")  // Ensure pi is replaced
            // Convert inverse trig results from radians to degrees if in degree mode
            .replace(/sin⁻¹\(([^)]+)\)/g, isDegreeMode ? "(asin($1)*180/Math.PI)" : "asin($1)")
            .replace(/cos⁻¹\(([^)]+)\)/g, isDegreeMode ? "(acos($1)*180/Math.PI)" : "acos($1)")
            .replace(/tan⁻¹\(([^)]+)\)/g, isDegreeMode ? "(atan($1)*180/Math.PI)" : "atan($1)")
            .replace(/sinh\(([^)]+)\)/g, "sinh($1)")
            .replace(/cosh\(([^)]+)\)/g, "cosh($1)")
            .replace(/tanh\(([^)]+)\)/g, "tanh($1)")
            .replace(/sinh⁻¹\(([^)]+)\)/g, "asinh($1)")
            .replace(/cosh⁻¹\(([^)]+)\)/g, "acosh($1)")
            .replace(/tanh⁻¹\(([^)]+)\)/g, "atanh($1)")
            .replace(/(\d+)!/g, "factorial($1)");

        // Send formatted expression to Flask
        const response = await fetch("http://127.0.0.1:5000/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression }) // Ensure JSON format
        });

        const data = await response.json();
        display.value = data.result !== undefined ? data.result : "Invalid Format";

        // ✅ Automatically add to history when calculation is performed
        if (data.result !== undefined) {
            addToHistory(expression, data.result);
        }

    } catch (error) {
        display.value = "Error: Server Not Running";
    }
}

function addToHistory(expression, result) {
    const historyList = document.getElementById("history-list");

    // Create a new history entry
    const entry = document.createElement("li");
    entry.classList.add("history-item");

    // Create a span for the calculation
    const span = document.createElement("span");
    span.textContent = `${expression} = ${result}`;

    // Create a delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.onclick = function () {
        deleteHistoryItem(entry);
    };

    // Append elements to the list item
    entry.appendChild(span);
    entry.appendChild(deleteButton);

    // Append to history list
    historyList.appendChild(entry);

    // Save to localStorage
    saveHistoryToLocalStorage();
}

function deleteHistoryItem(entry) {
    entry.remove(); // Remove the history item
    saveHistoryToLocalStorage(); // Update localStorage after deletion
}

function saveHistoryToLocalStorage() {
    const historyItems = document.querySelectorAll(".history-item");
    const historyData = [];

    historyItems.forEach(item => {
        historyData.push(item.innerText.replace("❌", "").trim());
    });

    localStorage.setItem("history", JSON.stringify(historyData));
}

function loadHistoryFromLocalStorage() {
    const historyList = document.getElementById("history-list");
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];

    savedHistory.forEach(entry => {
        const listItem = document.createElement("li");
        listItem.classList.add("history-item");
        listItem.innerHTML = `<span>${entry}</span> <button onclick="deleteHistoryItem(this.parentElement)">❌</button>`;
        historyList.appendChild(listItem);
    });
}

// Load history when the page loads
window.onload = loadHistoryFromLocalStorage;



