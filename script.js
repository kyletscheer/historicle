// Game state
let gameState = {
  currentGuess: "",
  guesses: [],
  gameStatus: "playing",
  usedHints: [],
  targetDate: null,
  currentRow: 0,
  mode: "daily", // 'daily' or 'random'
};

const MAX_GUESSES = 6;

// Get daily date (seeded by current day)
function getDailyDate() {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  const index = daysSinceEpoch % HISTORICAL_DATES.length;
  return HISTORICAL_DATES[index];
}

// Get random date
function getRandomDate() {
  const index = Math.floor(Math.random() * HISTORICAL_DATES.length);
  return HISTORICAL_DATES[index];
}

// Check if date is valid
function isValidDate(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return false;

  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (month < 1 || month > 12) return false;
  if (year < 1 || year > 2024) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check for leap year
  if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth[1] = 29;
  }

  if (day < 1 || day > daysInMonth[month - 1]) return false;

  return true;
}

// Initialize game
function initGame(mode = "daily") {
  gameState.mode = mode;

  if (mode === "daily") {
    gameState.targetDate = getDailyDate();
    loadGameState();
  } else {
    gameState.targetDate = getRandomDate();
    resetGameState();
  }

  renderGrid();
  renderKeyboard();

  // Show help on first visit
  if (!localStorage.getItem("historicle_played")) {
    document.getElementById("helpModal").classList.add("active");
    localStorage.setItem("historicle_played", "true");
  }
}

function resetGameState() {
  gameState.currentGuess = "";
  gameState.guesses = [];
  gameState.gameStatus = "playing";
  gameState.usedHints = [];
  document.getElementById("hintsSection").style.display = "none";
  document.getElementById("hintDisplay").innerHTML = "";
  document.getElementById("resultMessage").innerHTML = "";
}

// Render guess grid
function renderGrid() {
  const grid = document.getElementById("guessGrid");
  grid.innerHTML = "";

  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = document.createElement("div");
    row.className = "guess-row";

    const guess = gameState.guesses[i] || "";
    const tiles = guess.padEnd(10, " ").split("");

    // Month digits
    row.appendChild(createTile(tiles[0], i, 0));
    row.appendChild(createTile(tiles[1], i, 1));

    // Slash
    const slash1 = document.createElement("div");
    slash1.className = "slash";
    slash1.textContent = "/";
    row.appendChild(slash1);

    // Day digits
    row.appendChild(createTile(tiles[3], i, 3));
    row.appendChild(createTile(tiles[4], i, 4));

    // Slash
    const slash2 = document.createElement("div");
    slash2.className = "slash";
    slash2.textContent = "/";
    row.appendChild(slash2);

    // Year digits
    row.appendChild(createTile(tiles[6], i, 6));
    row.appendChild(createTile(tiles[7], i, 7));
    row.appendChild(createTile(tiles[8], i, 8));
    row.appendChild(createTile(tiles[9], i, 9));

    grid.appendChild(row);
  }
}

function createTile(char, row, col) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.textContent = char === " " ? "" : char;

  if (char !== " ") {
    tile.classList.add("filled");

    if (row < gameState.guesses.length) {
      const state = getTileState(row, col);
      tile.classList.add(state);
    }
  }

  return tile;
}

function getTileState(row, col) {
  const guess = gameState.guesses[row];
  const target = gameState.targetDate.date;

  // Convert to position in string without slashes
  const guessDigits = guess.replace(/\//g, "");
  const targetDigits = target.replace(/\//g, "");

  const digitCol = col > 5 ? col - 2 : col > 2 ? col - 1 : col;

  if (guessDigits[digitCol] === targetDigits[digitCol]) {
    return "correct";
  } else if (targetDigits.includes(guessDigits[digitCol])) {
    return "present";
  } else {
    return "absent";
  }
}

// Render keyboard
function renderKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  const rows = [
    ["1", "2", "3", "4", "5"],
    ["6", "7", "8", "9", "0"],
    ["ENTER", "DELETE"],
  ];

  rows.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    row.forEach((key) => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.textContent = key;

      if (key === "ENTER" || key === "DELETE") {
        btn.classList.add("wide");
      } else {
        const state = getKeyState(key);
        if (state) btn.classList.add(state);
      }

      btn.addEventListener("click", () => handleKey(key));
      rowDiv.appendChild(btn);
    });

    keyboard.appendChild(rowDiv);
  });
}

function getKeyState(key) {
  const target = gameState.targetDate.date.replace(/\//g, "");
  let state = null;

  gameState.guesses.forEach((guess) => {
    const guessDigits = guess.replace(/\//g, "");
    guessDigits.split("").forEach((digit, i) => {
      if (digit === key) {
        if (digit === target[i]) {
          state = "correct";
        } else if (target.includes(digit) && state !== "correct") {
          state = "present";
        } else if (!target.includes(digit) && !state) {
          state = "absent";
        }
      }
    });
  });

  return state;
}

// Handle key press
function handleKey(key) {
  if (gameState.gameStatus !== "playing") return;

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "DELETE") {
    deleteChar();
  } else {
    addChar(key);
  }
}

function addChar(char) {
  const cleanGuess = gameState.currentGuess.replace(/\//g, "");
  if (cleanGuess.length >= 8) return;

  gameState.currentGuess = cleanGuess + char;
  formatCurrentGuess();
  updateCurrentRow();
}

function deleteChar() {
  const cleanGuess = gameState.currentGuess.replace(/\//g, "");
  gameState.currentGuess = cleanGuess.slice(0, -1);
  formatCurrentGuess();
  updateCurrentRow();
}

function formatCurrentGuess() {
  const digits = gameState.currentGuess.replace(/\//g, "");
  if (digits.length <= 2) {
    gameState.currentGuess = digits;
  } else if (digits.length <= 4) {
    gameState.currentGuess = digits.slice(0, 2) + "/" + digits.slice(2);
  } else {
    gameState.currentGuess =
      digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
  }
}

function updateCurrentRow() {
  const row = gameState.guesses.length;
  const tiles = document
    .querySelectorAll(".guess-row")
    [row].querySelectorAll(".tile");
  const guess = gameState.currentGuess.padEnd(10, " ");

  let tileIndex = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] !== "/") {
      tiles[tileIndex].textContent = guess[i] === " " ? "" : guess[i];
      tiles[tileIndex].className = guess[i] === " " ? "tile" : "tile filled";
      tileIndex++;
    }
  }
}

function submitGuess() {
  const cleanGuess = gameState.currentGuess.replace(/\//g, "");

  if (cleanGuess.length !== 8) {
    showToast("Not enough digits");
    return;
  }

  if (!isValidDate(gameState.currentGuess)) {
    showToast("Invalid date");
    return;
  }

  gameState.guesses.push(gameState.currentGuess);
  gameState.currentGuess = "";

  renderGrid();
  renderKeyboard();

  // Show hints after 2 guesses
  if (gameState.guesses.length >= 2 && gameState.gameStatus === "playing") {
    document.getElementById("hintsSection").style.display = "block";
    // Re-enable unused hint buttons for the new turn
    enableUnusedHintButtons();
  }

  // Check win/loss
  if (
    gameState.guesses[gameState.guesses.length - 1] ===
    gameState.targetDate.date
  ) {
    gameState.gameStatus = "won";
    showResult(true);
    if (gameState.mode === "daily") {
      updateStats(true, gameState.guesses.length);
    }
  } else if (gameState.guesses.length >= MAX_GUESSES) {
    gameState.gameStatus = "lost";
    showResult(false);
    if (gameState.mode === "daily") {
      updateStats(false, 0);
    }
  }

  if (gameState.mode === "daily") {
    saveGameState();
  }
}

function showResult(won) {
  const resultDiv = document.getElementById("resultMessage");
  const rankMessages = [
    "Impossible!",
    "Magnificent!",
    "Amazing!",
    "Great!",
    "Good!",
    "Phew!",
  ];

  const shareButton =
    gameState.mode === "daily"
      ? '<button class="share-btn" onclick="shareResults()">Share Results</button>'
      : "";

  const playAgainButton =
    gameState.mode === "random"
      ? '<button class="play-again-btn" onclick="playAgain()">Play Again</button>'
      : "";

  if (won) {
    const rank = rankMessages[gameState.guesses.length - 1] || "Well done!";
    resultDiv.innerHTML = `
                    <div class="result-message">
                        <h2>🎉 ${rank}</h2>
                        <p>On <strong>${gameState.targetDate.date}</strong></p>
                        <p><a href="${gameState.targetDate.link}" target="_blank">${gameState.targetDate.event}</a></p>
                        <div class="action-buttons">
                            ${shareButton}
                            ${playAgainButton}
                        </div>
                    </div>
                `;
  } else {
    resultDiv.innerHTML = `
                    <div class="result-message fail">
                        <h2>Game Over</h2>
                        <p>The date was <strong>${gameState.targetDate.date}</strong></p>
                        <p><a href="${gameState.targetDate.link}" target="_blank">${gameState.targetDate.event}</a></p>
                        <div class="action-buttons">
                            ${shareButton}
                            ${playAgainButton}
                        </div>
                    </div>
                `;
  }
}

function playAgain() {
  initGame("random");
}

function shareResults() {
  const emoji = gameState.guesses
    .map((guess) => {
      return guess
        .split("")
        .map((char, i) => {
          if (char === "/") return "";
          const state = getTileState(gameState.guesses.indexOf(guess), i);
          return state === "correct" ? "🟩" : state === "present" ? "🟨" : "⬛";
        })
        .join("");
    })
    .join("\n");

  const text = `Historicle ${
    gameState.gameStatus === "won" ? gameState.guesses.length : "X"
  }/6\n\n${emoji}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard!");
    });
  } else {
    showToast(text);
  }
}

// Hints
document
  .getElementById("seasonHintBtn")
  .addEventListener("click", () => showHint("season"));
document
  .getElementById("eventHintBtn")
  .addEventListener("click", () => showHint("event"));
document
  .getElementById("whenHintBtn")
  .addEventListener("click", () => showHint("when"));

function showHint(type) {
  if (gameState.usedHints.includes(type)) return;

  gameState.usedHints.push(type);
  const hintDisplay = document.getElementById("hintDisplay");

  let hintText = "";
  if (type === "season") {
    const month = parseInt(gameState.targetDate.date.split("/")[0]);
    const seasons = [
      "January - March",
      "April - June",
      "July - September",
      "October - December",
    ];
    const seasonIndex = Math.floor((month - 1) / 3);
    hintText = `<strong>Season:</strong> ${seasons[seasonIndex]}`;
  } else if (type === "event") {
    hintText = `<strong>Event:</strong> ${gameState.targetDate.hint}`;
  } else if (type === "when") {
    const lastGuess = gameState.guesses[gameState.guesses.length - 1];
    const lastDate = new Date(lastGuess);
    const targetDate = new Date(gameState.targetDate.date);

    if (targetDate > lastDate) {
      hintText = `<strong>When:</strong> After ${lastGuess}`;
    } else {
      hintText = `<strong>When:</strong> Before ${lastGuess}`;
    }
  }

  const hintDiv = document.createElement("div");
  hintDiv.className = "hint-content";
  hintDiv.innerHTML = hintText;
  hintDisplay.appendChild(hintDiv);

  document.getElementById(`${type}HintBtn`).disabled = true;

  // Disable all hint buttons after using one (one hint per turn)
  disableAllHintButtons();

  if (gameState.mode === "daily") {
    saveGameState();
  }
}

function disableAllHintButtons() {
  document.getElementById("seasonHintBtn").disabled = true;
  document.getElementById("eventHintBtn").disabled = true;
  document.getElementById("whenHintBtn").disabled = true;
}

function enableUnusedHintButtons() {
  if (!gameState.usedHints.includes("season")) {
    document.getElementById("seasonHintBtn").disabled = false;
  }
  if (!gameState.usedHints.includes("event")) {
    document.getElementById("eventHintBtn").disabled = false;
  }
  if (!gameState.usedHints.includes("when")) {
    document.getElementById("whenHintBtn").disabled = false;
  }
}

// Stats
function updateStats(won, guesses) {
  const stats = getStats();

  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.distribution[guesses - 1]++;

    // Update streak
    const today = new Date().toDateString();
    const lastPlayed = stats.lastPlayedDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPlayed === today) {
      // Already played today, don't update streak
    } else if (lastPlayed === yesterday.toDateString()) {
      stats.currentStreak++;
    } else {
      stats.currentStreak = 1;
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = new Date().toDateString();
  localStorage.setItem("historicle_stats", JSON.stringify(stats));
}

function getStats() {
  const defaultStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: null,
  };

  const saved = localStorage.getItem("historicle_stats");
  return saved ? JSON.parse(saved) : defaultStats;
}

function displayStats() {
  const stats = getStats();

  document.getElementById("gamesPlayed").textContent = stats.gamesPlayed;
  document.getElementById("winPercent").textContent =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
  document.getElementById("currentStreak").textContent = stats.currentStreak;
  document.getElementById("maxStreak").textContent = stats.maxStreak;

  const chartDiv = document.getElementById("distributionChart");
  chartDiv.innerHTML = "";

  const maxCount = Math.max(...stats.distribution, 1);

  stats.distribution.forEach((count, i) => {
    const barDiv = document.createElement("div");
    barDiv.className = "distribution-bar";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = i + 1;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${(count / maxCount) * 100}%`;
    bar.textContent = count;

    if (
      gameState.gameStatus === "won" &&
      gameState.mode === "daily" &&
      i === gameState.guesses.length - 1
    ) {
      bar.classList.add("current");
    }

    barDiv.appendChild(label);
    barDiv.appendChild(bar);
    chartDiv.appendChild(barDiv);
  });
}

// Save/Load game state
function saveGameState() {
  const state = {
    date: new Date().toDateString(),
    guesses: gameState.guesses,
    gameStatus: gameState.gameStatus,
    usedHints: gameState.usedHints,
  };
  localStorage.setItem("historicle_game", JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem("historicle_game");
  if (!saved) return;

  const state = JSON.parse(saved);
  const today = new Date().toDateString();

  if (state.date === today) {
    gameState.guesses = state.guesses;
    gameState.gameStatus = state.gameStatus;
    gameState.usedHints = state.usedHints;

    if (gameState.gameStatus !== "playing") {
      showResult(gameState.gameStatus === "won");
    }

    if (gameState.guesses.length >= 2 && gameState.gameStatus === "playing") {
      document.getElementById("hintsSection").style.display = "block";

      // Re-display used hints and disable those buttons
      gameState.usedHints.forEach((type) => {
        let hintText = "";
        if (type === "season") {
          const month = parseInt(gameState.targetDate.date.split("/")[0]);
          const seasons = [
            "January - March",
            "April - June",
            "July - September",
            "October - December",
          ];
          const seasonIndex = Math.floor((month - 1) / 3);
          hintText = `<strong>Season:</strong> ${seasons[seasonIndex]}`;
        } else if (type === "event") {
          hintText = `<strong>Event:</strong> ${gameState.targetDate.hint}`;
        } else if (type === "when") {
          const lastGuess = gameState.guesses[gameState.guesses.length - 1];
          const lastDate = new Date(lastGuess);
          const targetDate = new Date(gameState.targetDate.date);

          if (targetDate > lastDate) {
            hintText = `<strong>When:</strong> After ${lastGuess}`;
          } else {
            hintText = `<strong>When:</strong> Before ${lastGuess}`;
          }
        }

        const hintDiv = document.createElement("div");
        hintDiv.className = "hint-content";
        hintDiv.innerHTML = hintText;
        document.getElementById("hintDisplay").appendChild(hintDiv);

        document.getElementById(`${type}HintBtn`).disabled = true;
      });

      // Enable unused hint buttons if all 3 hints haven't been used
      if (gameState.usedHints.length < 3) {
        enableUnusedHintButtons();
      }
    }
  }
}

// Toast notifications
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Mode toggle
document.getElementById("dailyModeBtn").addEventListener("click", () => {
  if (gameState.mode === "daily") return;

  document.getElementById("dailyModeBtn").classList.add("active");
  document.getElementById("randomModeBtn").classList.remove("active");
  initGame("daily");
});

document.getElementById("randomModeBtn").addEventListener("click", () => {
  if (gameState.mode === "random") return;

  document.getElementById("randomModeBtn").classList.add("active");
  document.getElementById("dailyModeBtn").classList.remove("active");
  initGame("random");
});

// Modal controls
document.getElementById("helpBtn").addEventListener("click", () => {
  document.getElementById("helpModal").classList.add("active");
});

document.getElementById("closeHelp").addEventListener("click", () => {
  document.getElementById("helpModal").classList.remove("active");
});

document.getElementById("statsBtn").addEventListener("click", () => {
  displayStats();
  document.getElementById("statsModal").classList.add("active");
});

document.getElementById("closeStats").addEventListener("click", () => {
  document.getElementById("statsModal").classList.remove("active");
});

document.getElementById("helpModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("helpModal")) {
    document.getElementById("helpModal").classList.remove("active");
  }
});

document.getElementById("statsModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("statsModal")) {
    document.getElementById("statsModal").classList.remove("active");
  }
});

// Keyboard input
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    handleKey(e.key);
  } else if (e.key === "Enter") {
    handleKey("ENTER");
  } else if (e.key === "Backspace") {
    handleKey("DELETE");
  }
});

// Initialize game on load
initGame("daily");
