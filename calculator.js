// Define defaults in one place
const DEFAULT_VALUES = {
  d4: { exp: "15000000", time: "5", cost: "200" },
  d2r: { exp: "25000000", time: "5", cost: "100" },
};

// Store game-specific values
let d4Values = { ...DEFAULT_VALUES.d4 };
let d2rValues = { ...DEFAULT_VALUES.d2r };

// Define default rows for each game type and party size
const D2R_DEFAULT_ROWS = {
  partySize1: ["60-90", "75-90"],
  partySizeGreaterThan1: ["1-60", "1-70", "1-80", "1-90"],
};

// Store rows for each game type
let d4Rows = ["1-60", "1-100", "1-150"];
let d2rRows = D2R_DEFAULT_ROWS.partySizeGreaterThan1;

// Add at the top with other state variables
let previousD2RRows = ["1-60", "1-70", "1-80", "1-90"]; // Store previous D2R rows

function createRowElement(levelRange = "", isFirstRow = false) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="center-align">
      <div class="field fill small">
        <input 
          class="powerleveling center-align" 
          type="text" 
          value="${levelRange}" 
          placeholder="${levelRange || "x-y"}" 
          aria-label="Enter level range (D4: 1-300, D2R: 1-99)"
        />
      </div>
    </td>
    <td class="runs" aria-label="Total number of runs required"></td>
    <td class="cost" aria-label="Total cost in forum gold"></td>
    <td class="time" aria-label="Total time to complete"></td>
    <td>
      <nav class="center-align">
        ${
          isFirstRow
            ? '<a class="add" aria-label="Add new level range"><i>add</i></a>'
            : '<a class="delete" aria-label="Delete row"><i>delete</i></a>'
        }
      </nav>
    </td>
  `;

  // Add event listeners directly to the new row
  const input = row.querySelector(".powerleveling");
  const deleteButton = row.querySelector(".delete");
  const addButton = row.querySelector(".add");

  if (input) {
    // Clear error state on input
    input.addEventListener("input", () => {
      input.classList.remove("invalid");
      const errorSpan = input.parentElement.querySelector(".error");
      if (errorSpan) {
        errorSpan.remove();
      }
      clearRowCalculations(row);
    });

    // Calculate on enter
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        calculate();
        saveStateToHash();
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      row.remove();
      calculate();
      saveStateToHash();
    });
  }

  if (addButton) {
    addButton.addEventListener("click", () => {
      addRow();
      saveStateToHash();
    });
  }

  return row;
}

function clearRowCalculations(row) {
  const cells = {
    runs: row.querySelector(".runs"),
    cost: row.querySelector(".cost"),
    time: row.querySelector(".time"),
  };

  Object.values(cells).forEach((cell) => {
    if (cell) {
      cell.innerText = "";
    }
  });
}

function addRow() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  // Get current game type and party size
  const isD4 = document.getElementById("d4Radio").checked;
  const partySize = document.getElementById("partySize")?.value || "2";

  // Determine default level range based on game type and party size
  let defaultRange = "";
  if (isD4) {
    defaultRange = "";
  } else {
    // For D2R, use different defaults based on party size
    if (partySize === "1") {
      defaultRange = "";
    } else {
      defaultRange = "";
    }
  }

  // Create new row with appropriate default
  const newRow = createRowElement(defaultRange);

  // Add the new row at the end
  tbody.appendChild(newRow);

  // Focus the new input
  const newInput = newRow.querySelector(".powerleveling");
  if (newInput) {
    newInput.focus();
  }

  // Save state after adding row
  saveStateToHash();
}

function updateLabels(isD4) {
  const location = isD4 ? "Pit 100" : "Chaos";
  const labels = {
    exp: `Experience per ${location}`,
    time: `Duration per ${location} (min)`,
    cost: `Cost per ${location} (fg)`,
  };

  // Update all labels at once
  Object.entries(labels).forEach(([id, text]) => {
    const label = document.getElementById(`${id}Label`);
    if (label) {
      label.textContent = text;
    }
  });

  // Update header title
  const headerTitle = document.querySelector("header h5");
  if (headerTitle) {
    headerTitle.textContent = isD4
      ? "Diablo 4 Powerleveling Calculator"
      : "D2R Powerleveling Calculator";
  }

  // Disable/enable experience input field based on game type
  const expInput = document.getElementById("exp");
  if (expInput) {
    if (isD4) {
      expInput.disabled = false;
      expInput.style.opacity = "1";
      expInput.style.cursor = "text";
    } else {
      expInput.disabled = true;
      expInput.style.opacity = "0.5";
      expInput.style.cursor = "not-allowed";
    }
  }
}

function updatePresetValues(isD4, useDefaults = false) {
  const fields = {
    exp: document.getElementById("exp"),
    time: document.getElementById("time"),
    cost: document.getElementById("cost"),
  };

  // Get the appropriate values
  const values = useDefaults
    ? isD4
      ? DEFAULT_VALUES.d4
      : DEFAULT_VALUES.d2r
    : isD4
    ? d4Values
    : d2rValues;

  // Update all fields at once
  Object.entries(fields).forEach(([key, field]) => {
    if (field && values[key] !== undefined) {
      field.value = values[key];
    }
  });

  // Handle D2R-specific fields
  if (!isD4) {
    const partySize = document.getElementById("partySize");
    if (partySize) {
      partySize.value = "2"; // Default party size for D2R
    }
  }
}

function initializeGameElements(isD4) {
  // Initialize D2R specific elements
  const partySizeContainer = document.getElementById("partySizeContainer");
  const d2rBonusContainer = document.getElementById("d2rBonusContainer");
  const d2rCheckboxContainer = document.getElementById("d2rCheckboxContainer");

  if (!isD4) {
    // Show D2R specific elements
    partySizeContainer.style.display = "inline-block";
    d2rBonusContainer.style.display = "inline-block";
    d2rCheckboxContainer.style.display = "flex";

    // Set default D2R values
    document.getElementById("partySize").value = "2";
    document.getElementById("anniBonus").value = "0";
    document.getElementById("expShrine").checked = false;
    document.getElementById("ondalsWisdom").checked = false;
  } else {
    // Hide D2R specific elements
    partySizeContainer.style.display = "none";
    d2rBonusContainer.style.display = "none";
    d2rCheckboxContainer.style.display = "none";
  }
}

function setupListeners() {
  // Set up listeners for game type changes
  setupGameTypeListeners();

  // Set up listeners for input fields
  setupInputListeners();

  // Set up listeners for buttons
  setupButtonListeners();
}

function setupGameTypeListeners() {
  const d4Radio = document.getElementById("d4Radio");
  const d2rRadio = document.getElementById("d2rRadio");

  const handleGameTypeChange = (isD4) => {
    try {
      // Update UI elements
      updateLabels(isD4);
      updatePresetValues(isD4);
      initializeGameElements(isD4);

      // Switch rows and recalculate
      switchRows(isD4);
      calculate();

      // Save state
      saveStateToHash();
    } catch (error) {
      console.error("Error handling game type change:", error);
      alert("Error switching game type. Please try again.");
    }
  };

  d4Radio.addEventListener("change", () => handleGameTypeChange(true));
  d2rRadio.addEventListener("change", () => handleGameTypeChange(false));
}

function setupInputListeners() {
  // Main input fields (exp, cost, time)
  const mainInputs = ["exp", "cost", "time"];
  mainInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        const isD4 = document.getElementById("d4Radio").checked;
        const values = isD4 ? d4Values : d2rValues;
        values[id] = input.value;
        calculate();
        saveStateToHash();
      });
    }
  });

  // D2R specific inputs
  const d2rInputs = {
    partySize: () => {
      const partySize = document.getElementById("partySize").value;
      const tbody = document.querySelector("tbody");
      if (!tbody) return;

      // Clear existing rows
      tbody.innerHTML = "";

      // Use appropriate default rows based on party size
      const defaultRows =
        partySize === "1"
          ? D2R_DEFAULT_ROWS.partySize1
          : D2R_DEFAULT_ROWS.partySizeGreaterThan1;

      // Add the default rows
      defaultRows.forEach((levelRange, index) => {
        const row = createRowElement(levelRange, index === 0);
        tbody.appendChild(row);
      });

      calculate();
      saveStateToHash();
    },
    anniBonus: () => calculate(),
    expShrine: () => calculate(),
    ondalsWisdom: () => calculate(),
  };

  Object.entries(d2rInputs).forEach(([id, handler]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", () => {
        handler();
        saveStateToHash();
      });
    }
  });
}

function setupButtonListeners() {
  // Share button listener
  const copyButton = document.getElementById("copyData");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const shareableHash = saveShareableStateToHash();
      const shareableUrl = `${window.location.origin}${window.location.pathname}#share=${shareableHash}`;
      await navigator.clipboard.writeText(shareableUrl);
    });
  }
}

function switchRows(isD4) {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  // Clear existing rows
  tbody.innerHTML = "";

  // Get the appropriate row set
  const rowSet = isD4 ? d4Rows : d2rRows;

  // Create rows for each level range
  rowSet.forEach((levelRange, index) => {
    const row = createRowElement(levelRange, index === 0);
    tbody.appendChild(row);
  });

  // If no rows exist, create a default first row
  if (rowSet.length === 0) {
    const defaultRange = isD4 ? "1-60" : "1-99";
    const row = createRowElement(defaultRange, true);
    tbody.appendChild(row);

    // Add to the appropriate array
    if (isD4) {
      d4Rows.push(defaultRange);
    } else {
      d2rRows.push(defaultRange);
    }
  }
}

function validateLevelRange(levelRange, isD4) {
  const [lvlFromString, lvlToString] = levelRange.split("-");
  const lvlFrom = Number(lvlFromString);
  const lvlTo = Number(lvlToString);
  const maxLevel = isD4 ? 300 : 99;

  if (isNaN(lvlFrom) || isNaN(lvlTo)) {
    return {
      valid: false,
      error: "Please enter two numbers separated by a - (e.g., 1-60)",
    };
  }

  if (lvlFrom < 1 || lvlTo > maxLevel) {
    return {
      valid: false,
      error: `Level range must be between 1 and ${maxLevel}`,
    };
  }

  if (lvlFrom > lvlTo) {
    return {
      valid: false,
      error: "End level must be higher than start level",
    };
  }

  // D2R specific validation
  if (!isD4) {
    const partySize = parseInt(document.getElementById("partySize").value) || 1;
    if (partySize === 1 && lvlFrom < 60) {
      return {
        valid: false,
        error: "For party size 1, starting level must be at least 60",
      };
    }
  }

  return {
    valid: true,
    from: lvlFrom,
    to: lvlTo,
  };
}

function calculateD2RExperience(from, to, partySize) {
  let totalRuns = 0;
  let currentLevel = from;

  // Get bonus values
  const expShrineBonus = document.getElementById("expShrine").checked ? 50 : 0;
  const anniBonus = parseInt(document.getElementById("anniBonus").value) || 0;
  const ondalsBonus = document.getElementById("ondalsWisdom").checked ? 5 : 0;

  while (currentLevel < to) {
    const currentLevelData = D2RlevelData[currentLevel - 1];
    const nextLevelData = D2RlevelData[currentLevel];
    const expNeededForNextLevel = nextLevelData[2] - currentLevelData[2];
    const baseExpPerRun = d2rLevelExpData[currentLevel][partySize];

    // Calculate total bonus
    let currentExpBonus = expShrineBonus;
    if (currentLevel >= 70 && anniBonus > 0) {
      currentExpBonus += anniBonus;
    }
    if (currentLevel >= 66 && ondalsBonus > 0) {
      currentExpBonus += ondalsBonus;
    }

    const expPerRun =
      currentExpBonus > 0
        ? baseExpPerRun * (1 + currentExpBonus / 100)
        : baseExpPerRun;

    totalRuns += expNeededForNextLevel / expPerRun;
    currentLevel++;
  }

  return Math.ceil(totalRuns);
}

function calculateD4Experience(from, to, expPerDungeon) {
  const lvlDataFrom = D4levelData[from - 1];
  const lvlDataTo = D4levelData[to - 1];
  const expNeeded = lvlDataTo[2] - lvlDataFrom[2];
  return Math.ceil(expNeeded / expPerDungeon);
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  return (hours > 0 ? `${hours} h ` : "") + `${remainingMinutes} m`;
}

function calculate() {
  const isD4 = document.getElementById("d4Radio").checked;
  const expPerDungeon = parseFloat(document.getElementById("exp").value) || 0;
  const timePerDungeon = parseFloat(document.getElementById("time").value) || 0;
  const costPerDungeon = parseFloat(document.getElementById("cost").value) || 0;

  const rows = document.querySelectorAll("tbody tr");
  for (const row of rows) {
    const input = row.querySelector(".powerleveling");
    if (!input) continue;

    const levelRange = input.value.trim();
    if (!levelRange) {
      clearRowCalculations(row);
      continue;
    }

    // Validate level range
    const validation = validateLevelRange(levelRange, isD4);
    if (!validation.valid) {
      input.classList.add("invalid");
      if (!row.querySelector(".error")) {
        const span = document.createElement("span");
        span.classList.add("error");
        span.setAttribute("role", "alert");
        input.after(span);
      }
      row.querySelector(".error").innerText = validation.error;
      clearRowCalculations(row);
      continue;
    }

    // Clear error state
    input.classList.remove("invalid");
    const errorSpan = row.querySelector(".error");
    if (errorSpan) {
      errorSpan.remove();
    }

    // Calculate runs needed
    let totalRuns;
    if (isD4) {
      totalRuns = calculateD4Experience(
        validation.from,
        validation.to,
        expPerDungeon
      );
    } else {
      const partySize =
        parseInt(document.getElementById("partySize").value) || 1;
      totalRuns = calculateD2RExperience(
        validation.from,
        validation.to,
        partySize
      );
    }

    // Calculate time and cost
    const totalTime = totalRuns * timePerDungeon;
    const totalCost = totalRuns * costPerDungeon;

    // Update row
    row.querySelector(".runs").innerText = totalRuns;
    row.querySelector(".cost").innerText = `${totalCost.toFixed(0)} fg`;
    row.querySelector(".time").innerText = formatTime(totalTime);
  }
}

function getCurrentState() {
  const isD4 = document.getElementById("d4Radio").checked;
  const gameValues = isD4 ? d4Values : d2rValues;

  const state = {
    game: isD4 ? "d4" : "d2r",
    values: {
      exp: gameValues.exp,
      time: gameValues.time,
      cost: gameValues.cost,
    },
    powerleveling: [],
    results: [],
    previousD2RRows: previousD2RRows, // Store previous rows in state
  };

  // Add D2R specific values
  if (!isD4) {
    state.d2r = {
      partySize: document.getElementById("partySize").value,
      anniBonus: document.getElementById("anniBonus").value,
      expShrine: document.getElementById("expShrine").checked,
      ondalsWisdom: document.getElementById("ondalsWisdom").checked,
    };
  }

  // Add powerleveling values and their results
  document.querySelectorAll("tbody tr").forEach((row) => {
    const input = row.querySelector(".powerleveling");
    const runs = row.querySelector(".runs");
    const cost = row.querySelector(".cost");
    const time = row.querySelector(".time");

    if (input && input.value.trim()) {
      state.powerleveling.push(input.value);

      // Include results even if there are errors
      state.results.push({
        runs: runs ? runs.innerText : "",
        cost: cost ? cost.innerText : "",
        time: time ? time.innerText : "",
        hasError:
          row.querySelector(".error") !== null ||
          input.classList.contains("invalid"),
      });
    }
  });

  return state;
}

function saveStateToHash() {
  const state = getCurrentState();
  const base64 = btoa(JSON.stringify(state));

  // Use history.pushState instead of directly setting window.location.hash
  // This prevents the page from reloading
  const newUrl = window.location.pathname + "#" + base64;
  history.pushState(null, "", newUrl);
}

function restoreStateFromHash() {
  if (!window.location.hash) {
    // Set default values for D4 (since it's checked by default)
    updatePresetValues(true, true);
    switchRows(true);
    calculate();
    return;
  }

  try {
    const hash = window.location.hash.substring(1);
    const state = JSON.parse(atob(hash));

    // Set game type
    const isD4 = state.game === "d4";
    document.getElementById("d4Radio").checked = isD4;
    document.getElementById("d2rRadio").checked = !isD4;

    // Update labels and values
    updateLabels(isD4);
    updatePresetValues(isD4);

    // Restore previous D2R rows if they exist
    if (state.previousD2RRows) {
      previousD2RRows = state.previousD2RRows;
    }

    // Restore D2R specific values
    if (!isD4 && state.d2r) {
      const { partySize, anniBonus, expShrine, ondalsWisdom } = state.d2r;
      document.getElementById("partySize").value = partySize;
      document.getElementById("anniBonus").value = anniBonus;
      document.getElementById("expShrine").checked = expShrine;
      document.getElementById("ondalsWisdom").checked = ondalsWisdom;
    }

    // Toggle D2R options visibility
    const partySizeContainer = document.getElementById("partySizeContainer");
    const d2rBonusContainer = document.getElementById("d2rBonusContainer");
    const d2rCheckboxContainer = document.getElementById(
      "d2rCheckboxContainer"
    );

    if (partySizeContainer)
      partySizeContainer.style.display = isD4 ? "none" : "inline-block";
    if (d2rBonusContainer)
      d2rBonusContainer.style.display = isD4 ? "none" : "inline-block";
    if (d2rCheckboxContainer)
      d2rCheckboxContainer.style.display = isD4 ? "none" : "flex";

    // Update rows based on game type and stored values
    if (isD4) {
      d4Rows = state.powerleveling;
    } else {
      d2rRows = state.powerleveling;
    }

    // Switch rows and calculate
    switchRows(isD4);
    calculate();
  } catch (error) {
    console.error("Error restoring state:", error);
    // Fallback to defaults
    updatePresetValues(true, true);
    switchRows(true);
    calculate();
  }
}

function createShareableTable() {
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
    const hasError =
      row.querySelector(".error") !== null ||
      row.querySelector(".powerleveling").classList.contains("invalid");

    // Only add rows that have input values
    if (levelRange) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${levelRange}</td>
        <td>${runs || (hasError ? "Error" : "")}</td>
        <td>${cost || (hasError ? "Error" : "")}</td>
        <td>${time || (hasError ? "Error" : "")}</td>
      `;
      tbody.appendChild(tr);
    }
  });
  table.appendChild(tbody);

  return table;
}

function saveShareableStateToHash() {
  // Force a calculation to ensure values are up to date
  calculate();

  const state = getCurrentState();
  const timestamp = Date.now();
  const shareableState = {
    ...state,
    timestamp,
    type: "share",
  };
  return btoa(JSON.stringify(shareableState));
}

function createShareableView(hash) {
  try {
    const state = JSON.parse(atob(hash));
    if (state.type !== "share") return null;

    const container = document.createElement("div");
    container.className = "responsive dark";

    // Add header
    const header = document.createElement("header");
    header.className = "secondary-container";
    header.innerHTML = `
      <nav>
        <button class="circle transparent" aria-label="Diablo icon">
          <img class="responsive" src="icon.ico" alt="Diablo game icon" />
        </button>
        <h5 class="max center-align">${
          state.game === "d4" ? "Diablo 4" : "D2R"
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

    // Add header - removed Required Runs column
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th scope="col">Level Range</th>
        <th scope="col">Total Cost</th>
        <th scope="col">Time to Complete</th>
      </tr>
    `;
    table.appendChild(thead);

    // Add body - removed Required Runs column
    const tbody = document.createElement("tbody");
    state.powerleveling.forEach((range, index) => {
      const result = state.results[index];
      if (result) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${range}</td>
          <td>${result.cost}</td>
          <td>${result.time}</td>
        `;
        tbody.appendChild(tr);
      }
    });
    table.appendChild(tbody);

    article.appendChild(table);
    main.appendChild(article);
    container.appendChild(main);

    return container.outerHTML;
  } catch (error) {
    console.error("Error creating share view:", error);
    return null;
  }
}

function initializeCalculator() {
  try {
    // Set up initial state
    const isD4 = document.getElementById("d4Radio").checked;

    // Initialize game-specific elements
    initializeGameElements(isD4);

    // Set up initial values
    updateLabels(isD4);
    updatePresetValues(isD4, true);

    // Set up initial row and listeners
    setupInitialRow();
    setupListeners();

    // Perform initial calculation
    calculate();

    // Restore state from URL if present
    if (window.location.hash && !window.location.hash.includes("#share=")) {
      restoreStateFromHash();
    }
  } catch (error) {
    console.error("Error initializing calculator:", error);
    alert("Error initializing calculator. Please refresh the page.");
  }
}

function setupInitialRow() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  // Clear any existing rows
  tbody.innerHTML = "";

  // Get current game type
  const isD4 = document.getElementById("d4Radio").checked;

  // Get default rows for the current game type
  const defaultRows = isD4 ? d4Rows : d2rRows;

  // Add default rows
  defaultRows.forEach((levelRange, index) => {
    const row = createRowElement(levelRange, index === 0);
    tbody.appendChild(row);
  });
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // Check if this is a share link
  if (window.location.hash.includes("#share=")) {
    const hashParts = window.location.hash.split("&");
    const hash = hashParts[0].substring(7);
    const shareView = createShareableView(hash);
    if (shareView) {
      document.body.innerHTML = shareView;
      return;
    }
  }

  // Initialize calculator
  initializeCalculator();
});

// Update the hashchange listener
window.addEventListener("hashchange", function () {
  if (window.location.hash.includes("#share=")) {
    const hashParts = window.location.hash.split("&");
    const hash = hashParts[0].substring(7);
    const shareView = createShareableView(hash);
    if (shareView) {
      document.body.innerHTML = shareView;
      return;
    }
  }

  // Normal initialization for non-share links
  restoreStateFromHash();
  setupListeners();
});
