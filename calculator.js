// Define defaults in one place instead of duplicating in updatePresetValues
const DEFAULT_VALUES = {
  d4: { exp: "15000000", time: "5", cost: "200" },
  d2r: { exp: "25000000", time: "5", cost: "100" },
};

// Add these variables to store game-specific values
let d4Values = {
  exp: "15000000",
  time: "5",
  cost: "200",
};

let d2rValues = {
  exp: "25000000",
  time: "5",
  cost: "100",
};

function addRow() {
  // Create new row
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="center-align">
      <div class="field fill small">
        <input class="powerleveling center-align" type="text" placeholder="60-70" aria-label="Enter level range">
      </div>
    </td>
    <td class="runs" aria-label="Total number of runs required"></td>
    <td class="cost" aria-label="Total cost in forum gold"></td>
    <td class="time" aria-label="Total time to complete"></td>
    <td>
      <nav class="center-align">
        <a class="delete" aria-label="Delete row">
          <i>delete</i>
        </a>
      </nav>
    </td>
  `;

  // Add the new row to the table
  document.querySelector("tbody").appendChild(row);

  // Add event listeners to the new row
  const newInput = row.querySelector(".powerleveling");
  newInput.addEventListener("keyup", () => {
    calculate();
    saveStateToHash();
  });

  // Add delete functionality to the new row
  const deleteButton = row.querySelector(".delete");
  deleteButton.addEventListener("click", function () {
    row.remove();
    calculate();
    saveStateToHash();
  });

  // Calculate with the new row
  calculate();
  saveStateToHash();
}

function updateLabels(isD4) {
  const location = isD4 ? "Pit 100" : "Chaos";
  document.getElementById(
    "expLabel"
  ).textContent = `Experience per ${location}`;
  document.getElementById(
    "timeLabel"
  ).textContent = `Duration per ${location} (min)`;
  document.getElementById(
    "costLabel"
  ).textContent = `Cost per ${location} (fg)`;
}

function updatePresetValues(isD4, useDefaults = false) {
  const exp = document.getElementById("exp");
  const time = document.getElementById("time");
  const cost = document.getElementById("cost");

  if (useDefaults) {
    if (isD4) {
      d4Values = { ...DEFAULT_VALUES.d4 };
    } else {
      d2rValues = { ...DEFAULT_VALUES.d2r };
    }
  }

  // Use stored values for the selected game
  if (isD4) {
    exp.value = d4Values.exp;
    time.value = d4Values.time;
    cost.value = d4Values.cost;
  } else {
    exp.value = d2rValues.exp;
    time.value = d2rValues.time;
    cost.value = d2rValues.cost;
  }
}

function setupListeners() {
  // Add listeners for input fields in user input section
  document.querySelectorAll("#userInput input").forEach((input) => {
    input.addEventListener("keyup", () => {
      // Store values when they change
      const isD4 = document.getElementById("d4Radio").checked;
      if (isD4) {
        d4Values.exp = document.getElementById("exp").value;
        d4Values.time = document.getElementById("time").value;
        d4Values.cost = document.getElementById("cost").value;
      } else {
        d2rValues.exp = document.getElementById("exp").value;
        d2rValues.time = document.getElementById("time").value;
        d2rValues.cost = document.getElementById("cost").value;
      }
      calculate();
    });
  });

  // Add listeners for radio buttons
  const d4Radio = document.getElementById("d4Radio");
  const d2rRadio = document.getElementById("d2rRadio");
  const partySizeContainer = document.getElementById("partySizeContainer");
  const partySizeSelect = document.getElementById("partySize");
  const d2rBonusContainer = document.getElementById("d2rBonusContainer");
  const d2rCheckboxContainer = document.getElementById("d2rCheckboxContainer");
  const anniBonusSelect = document.getElementById("anniBonus");
  const expShrineCheckbox = document.getElementById("expShrine");
  const ondalsWisdomCheckbox = document.getElementById("ondalsWisdom");

  // Function to toggle D2R options visibility
  function toggleD2ROptions() {
    const isD2R = document.getElementById("d2rRadio").checked;
    partySizeContainer.style.display = isD2R ? "inline-block" : "none";
    d2rBonusContainer.style.display = isD2R ? "inline-block" : "none";
    d2rCheckboxContainer.style.display = isD2R ? "flex" : "none";

    // Hide/show experience input field
    const expInput = document.getElementById("exp").closest(".field");
    expInput.style.display = isD2R ? "none" : "block";

    // Update header title
    const headerTitle = document.querySelector("header h5");
    headerTitle.textContent = isD2R
      ? "Diablo 2 Powerleveling Calculator"
      : "Diablo 4 Powerleveling Calculator";
  }

  // Initial toggle based on default selection
  toggleD2ROptions();

  d4Radio.addEventListener("change", () => {
    updateLabels(true);
    updatePresetValues(true);
    toggleD2ROptions();
    calculate();
    saveStateToHash();
  });

  d2rRadio.addEventListener("change", () => {
    updateLabels(false);
    updatePresetValues(false);
    toggleD2ROptions();
    calculate();
    saveStateToHash();
  });

  // Add listener for party size changes
  partySizeSelect.addEventListener("change", () => {
    calculate();
    saveStateToHash();
  });

  // Add listeners for bonus options
  anniBonusSelect.addEventListener("change", () => {
    calculate();
    saveStateToHash();
  });

  expShrineCheckbox.addEventListener("change", () => {
    calculate();
    saveStateToHash();
  });

  // Add listener for the first row's add button
  const initialAddButton = document.querySelector("tbody tr:first-child .add");
  if (initialAddButton) {
    initialAddButton.addEventListener("click", addRow);
  }

  // Add listener for the first row's powerleveling input
  const firstRowInput = document.querySelector(
    "tbody tr:first-child .powerleveling"
  );
  if (firstRowInput) {
    firstRowInput.addEventListener("keyup", () => {
      calculate();
      saveStateToHash();
    });
  }
}

function calculate() {
  const expPerDungeon = parseFloat(document.getElementById("exp").value) || 0;
  const timePerDungeon = parseFloat(document.getElementById("time").value) || 0;
  const costPerDungeonValue =
    parseFloat(document.getElementById("cost").value) || 0;

  // Get the selected game's level data and max level
  const isD4Selected = document.getElementById("d4Radio").checked;
  const levelData = isD4Selected ? D4levelData : D2RlevelData;
  const maxLevel = isD4Selected ? 300 : 99;

  // Get party size for D2R
  let partySize = 1;
  if (!isD4Selected) {
    partySize = parseInt(document.getElementById("partySize").value) || 1;
  }

  // Calculate experience bonus for D2R
  let expBonus = 0;
  if (!isD4Selected) {
    // Get Anni bonus (requires level 70)
    const anniBonus = parseInt(document.getElementById("anniBonus").value) || 0;

    // Get Exp Shrine bonus (50%)
    const expShrineBonus = document.getElementById("expShrine").checked
      ? 50
      : 0;

    // Get Ondal's Wisdom bonus (5%, requires level 66)
    const ondalsBonus = document.getElementById("ondalsWisdom").checked ? 5 : 0;

    // Calculate total bonus
    expBonus = expShrineBonus; // Always add shrine bonus if active

    const rows = document.querySelectorAll("tbody tr");
    for (const row of rows) {
      const levelRange = row.querySelector(".powerleveling").value;

      // Clear columns if input is empty
      if (!levelRange.trim()) {
        row.querySelector(".cost").innerText = "";
        row.querySelector(".runs").innerText = "";
        row.querySelector(".time").innerText = "";
        continue;
      }

      const [lvlFromString, lvlToString] = levelRange.split("-");
      const lvlFrom = Number(lvlFromString);
      const lvlTo = Number(lvlToString);

      // validate input lvl from < lvl to
      if (
        isNaN(lvlFrom) ||
        isNaN(lvlTo) ||
        lvlFrom < 1 ||
        lvlTo > maxLevel ||
        lvlFrom > lvlTo
      ) {
        // Handle validation errors as before...
        row.querySelector(".powerleveling").classList.add("invalid");
        if (!row.querySelector(".error")) {
          const span = document.createElement("span");
          span.classList.add("error");
          span.setAttribute("role", "alert");
          row.querySelector(".powerleveling").after(span);
        }
        const span = row.querySelector(".error");
        if (isNaN(lvlFrom) || isNaN(lvlTo)) {
          span.innerText =
            "Please enter two numbers separated by a - (e.g., 1-60)";
        } else if (lvlFrom < 1 || lvlTo > maxLevel) {
          span.innerText = `Level range must be between 1 and ${maxLevel}`;
        } else if (lvlFrom > lvlTo) {
          span.innerText = "End level must be higher than start level";
        }
        row.querySelector(".cost").innerText = "";
        row.querySelector(".runs").innerText = "";
        row.querySelector(".time").innerText = "";
        continue;
      } else {
        row.querySelector(".powerleveling").classList.remove("invalid");
        if (row.querySelector(".error")) {
          row.querySelector(".error").remove();
        }
      }

      let totalRuns;
      let totalTime;
      let totalCost;

      const lvlDataFrom = levelData[lvlFrom - 1];
      const lvlDataTo = levelData[lvlTo - 1];
      const expNeeded = lvlDataTo[2] - lvlDataFrom[2];

      if (isD4Selected) {
        // Original calculation for Diablo 4
        totalRuns = Math.ceil(expNeeded / expPerDungeon);
      } else {
        // Calculate runs needed level by level for D2R
        totalRuns = 0;
        let currentLevel = lvlFrom;

        while (currentLevel < lvlTo) {
          // Get experience data for current level and next level
          const currentLevelData = levelData[currentLevel - 1];
          const nextLevelData = levelData[currentLevel];

          // Calculate experience needed for next level
          const expNeededForNextLevel = nextLevelData[2] - currentLevelData[2];

          // Get base experience per run for current level and party size
          const baseExpPerRun = d2rLevelExpData[currentLevel][partySize];

          // Apply experience bonus if any
          let currentExpBonus = expShrineBonus; // Always add shrine bonus if active

          // Add Anni bonus if level requirement met
          if (currentLevel >= 70 && anniBonus > 0) {
            currentExpBonus += anniBonus;
          }

          // Add Ondal's Wisdom bonus if level requirement met
          if (currentLevel >= 66 && ondalsBonus > 0) {
            currentExpBonus += ondalsBonus;
          }

          const expPerRun =
            currentExpBonus > 0
              ? baseExpPerRun * (1 + currentExpBonus / 100)
              : baseExpPerRun;

          // Calculate runs needed for this level
          const runsForLevel = expNeededForNextLevel / expPerRun;
          totalRuns += runsForLevel;

          // Move to next level
          currentLevel++;
        }
      }

      totalRuns = Math.ceil(totalRuns);
      totalTime = totalRuns * timePerDungeon;
      totalCost = totalRuns * costPerDungeonValue;

      row.querySelector(".runs").innerText = totalRuns;
      row.querySelector(".cost").innerText = totalCost.toFixed(0) + " fg";

      let hours = Math.floor(totalTime / 60);
      let minutes = Math.floor(totalTime % 60);
      row.querySelector(".time").innerText =
        (hours > 0 ? hours + " h " : "") + minutes + " m";
    }
  }
}

function saveStateToHash() {
  const isD4 = document.getElementById("d4Radio").checked;
  const gameValues = isD4 ? d4Values : d2rValues;
  const partySize = document.getElementById("partySize").value;
  const anniBonus = document.getElementById("anniBonus").value;
  const expShrine = document.getElementById("expShrine").checked;
  const ondalsWisdom = document.getElementById("ondalsWisdom").checked;

  let text = "";
  // Add the current game's values
  text += `exp=${gameValues.exp};`;
  text += `time=${gameValues.time};`;
  text += `cost=${gameValues.cost};`;

  // Add party size for D2R
  if (!isD4) {
    text += `party=${partySize};`;
    text += `anni=${anniBonus};`;
    text += `shrine=${expShrine ? 1 : 0};`;
    text += `ondals=${ondalsWisdom ? 1 : 0};`;
  }

  // Add powerleveling values
  document.querySelectorAll("input.powerleveling").forEach((input) => {
    text += `pl=${input.value};`;
  });

  // Add game selection
  text += `game=${isD4 ? "d4" : "d2r"};`;

  const base64 = btoa(text);
  window.location.hash = base64;
}

function restoreStateFromHash() {
  if (window.location.hash) {
    const hash = window.location.hash.substr(1);
    const decoded = atob(hash);
    const values = decoded.split(";");

    // Find game type first
    let isD4 = true;
    for (const value of values) {
      if (value.startsWith("game=")) {
        isD4 = value.substring(5) === "d4";
        if (isD4) {
          document.getElementById("d4Radio").checked = true;
        } else {
          document.getElementById("d2rRadio").checked = true;
        }
        break;
      }
    }

    // Parse and store values
    let plValues = [];
    for (const value of values) {
      if (value.startsWith("exp=")) {
        if (isD4) d4Values.exp = value.substring(4);
        else d2rValues.exp = value.substring(4);
      } else if (value.startsWith("time=")) {
        if (isD4) d4Values.time = value.substring(5);
        else d2rValues.time = value.substring(5);
      } else if (value.startsWith("cost=")) {
        if (isD4) d4Values.cost = value.substring(5);
        else d2rValues.cost = value.substring(5);
      } else if (value.startsWith("party=")) {
        document.getElementById("partySize").value = value.substring(6);
      } else if (value.startsWith("anni=")) {
        document.getElementById("anniBonus").value = value.substring(5);
      } else if (value.startsWith("shrine=")) {
        document.getElementById("expShrine").checked =
          value.substring(7) === "1";
      } else if (value.startsWith("ondals=")) {
        document.getElementById("ondalsWisdom").checked =
          value.substring(7) === "1";
      } else if (value.startsWith("pl=")) {
        plValues.push(value.substring(3));
      }
    }

    // Update UI with stored values
    updateLabels(isD4);
    updatePresetValues(isD4);

    // Toggle D2R options visibility
    const partySizeContainer = document.getElementById("partySizeContainer");
    const d2rBonusContainer = document.getElementById("d2rBonusContainer");
    const d2rCheckboxContainer = document.getElementById(
      "d2rCheckboxContainer"
    );
    partySizeContainer.style.display = isD4 ? "none" : "inline-block";
    d2rBonusContainer.style.display = isD4 ? "none" : "inline-block";
    d2rCheckboxContainer.style.display = isD4 ? "none" : "flex";

    // Handle powerleveling rows
    const currentRows = document.querySelectorAll("input.powerleveling");
    // Add any missing rows
    while (currentRows.length < plValues.length) {
      addRow();
    }

    // Update powerleveling values
    document.querySelectorAll("input.powerleveling").forEach((input, index) => {
      if (plValues[index]) {
        input.value = plValues[index];
      }
    });

    calculate();
  } else {
    // If no hash, set default values for D4 (since it's checked by default)
    updatePresetValues(true, true);
    calculate();
  }
}

function createShareableTable() {
  // Create a simplified table for sharing
  const table = document.createElement("table");
  table.className = "border center-align";

  // Add header
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th scope="col">Level Range</th>
      <th scope="col">Required Runs</th>
      <th scope="col">Total Cost</th>
      <th scope="col">Time to Complete</th>
    </tr>
  `;
  table.appendChild(thead);

  // Add body
  const tbody = document.createElement("tbody");
  document.querySelectorAll("tbody tr").forEach((row) => {
    const levelRange = row.querySelector(".powerleveling").value;
    const runs = row.querySelector(".runs").innerText;
    const cost = row.querySelector(".cost").innerText;
    const time = row.querySelector(".time").innerText;

    // Only add rows that have valid input
    if (levelRange && runs && cost && time) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${levelRange}</td>
        <td>${runs}</td>
        <td>${cost}</td>
        <td>${time}</td>
      `;
      tbody.appendChild(tr);
    }
  });
  table.appendChild(tbody);

  return table;
}

function saveShareableStateToHash() {
  const isD4 = document.getElementById("d4Radio").checked;
  let text = "";

  // Add game type
  text += `game=${isD4 ? "d4" : "d2r"};`;

  // Force a calculation to ensure values are up to date
  calculate();

  // Add only the level ranges, costs, and times
  document.querySelectorAll("tbody tr").forEach((row) => {
    const levelRange = row.querySelector(".powerleveling")?.value;
    const runs = row.querySelector(".runs")?.innerText;
    const cost = row.querySelector(".cost")?.innerText;
    const time = row.querySelector(".time")?.innerText;

    // Only add valid rows that have all values
    if (levelRange && runs && cost && time && levelRange.trim() !== "") {
      // Remove any existing error messages or invalid states
      if (
        !row.querySelector(".error") &&
        !row.querySelector(".powerleveling").classList.contains("invalid")
      ) {
        text += `entry=${levelRange}|${runs}|${cost}|${time};`;
      }
    }
  });

  return btoa(text);
}

function createShareableView(hash) {
  // Decode the hash
  const decoded = atob(hash);
  const values = decoded.split(";");

  // Create container
  const container = document.createElement("div");
  container.className = "responsive dark";

  // Find game type
  let isD4 = true;
  for (const value of values) {
    if (value.startsWith("game=")) {
      isD4 = value.substring(5) === "d4";
      break;
    }
  }

  // Add header with icons on both sides
  const header = document.createElement("header");
  header.className = "secondary-container";
  header.innerHTML = `
    <nav>
      <button class="circle transparent" aria-label="Diablo icon">
        <img class="responsive" src="icon.ico" alt="Diablo game icon" />
      </button>
      <h5 class="max center-align">${
        isD4 ? "Diablo 4" : "Diablo 2"
      } Powerleveling Calculator</h5>
      <button class="circle transparent" aria-label="Diablo icon">
        <img class="responsive" src="icon.ico" alt="Diablo game icon" />
      </button>
    </nav>
  `;
  container.appendChild(header);

  // Create main content
  const main = document.createElement("main");
  main.className = "responsive";

  // Create article
  const article = document.createElement("article");
  article.className = "fill";

  // Create table
  const table = document.createElement("table");
  table.className = "border center-align";

  // Add header
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th scope="col">Level Range</th>
      <th scope="col">Required Runs</th>
      <th scope="col">Total Cost</th>
      <th scope="col">Time to Complete</th>
    </tr>
  `;
  table.appendChild(thead);

  // Add body
  const tbody = document.createElement("tbody");

  // Process entries
  values.forEach((value) => {
    if (value.startsWith("entry=")) {
      const [range, runs, cost, time] = value.substring(6).split("|");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${range}</td>
        <td>${runs}</td>
        <td>${cost}</td>
        <td>${time}</td>
      `;
      tbody.appendChild(tr);
    }
  });

  table.appendChild(tbody);
  article.appendChild(table);
  main.appendChild(article);
  container.appendChild(main);

  // Add dark theme class to body
  document.body.className = "dark";

  return container.outerHTML;
}

// Initialize the calculator when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if this is a share link
  if (window.location.hash.includes("#share=")) {
    const hashParts = window.location.hash.split("&");
    const hash = hashParts[0].substring(7); // Remove '#share=' prefix
    document.body.innerHTML = createShareableView(hash);
    return;
  }

  // Set initial values and setup listeners
  const isD4 = document.getElementById("d4Radio").checked;
  updateLabels(isD4);
  updatePresetValues(isD4, true); // Use defaults on initial load
  setupListeners();
  calculate();

  // Add listener for the Copy Data button
  const copyButton = document.getElementById("copyData");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      // Force a calculation before creating the share link
      calculate();

      // Create shareable URL with minimal data and timestamp
      const shareableHash = saveShareableStateToHash();
      const timestamp = Date.now(); // Add current timestamp
      const shareableUrl = `${window.location.origin}${window.location.pathname}#share=${shareableHash}&t=${timestamp}`;

      try {
        await navigator.clipboard.writeText(shareableUrl);
        alert("Shareable link copied to clipboard!");
      } catch (err) {
        const el = document.createElement("textarea");
        el.value = shareableUrl;
        document.body.appendChild(el);
        el.select();
        try {
          document.execCommand("copy");
          alert("Shareable link copied to clipboard!");
        } catch (err) {
          alert("Failed to copy link. Please copy the URL manually.");
        }
        document.body.removeChild(el);
      }
    });
  }
});

// Also modify the hashchange listener
window.addEventListener("hashchange", function () {
  if (window.location.hash.includes("#share=")) {
    const hashParts = window.location.hash.split("&");
    const hash = hashParts[0].substring(7);
    document.body.innerHTML = createShareableView(hash);
    return;
  }

  // Normal initialization for allowed domains
  restoreStateFromHash();
  setupListeners();
});
