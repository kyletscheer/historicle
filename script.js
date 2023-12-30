// Game variables
let correctDate;
let result = "";
let winStatus = false;
let failStatus = false;
let guesses = [];
let hints = [];
const maxAttempts = 6;
let attempts = 0;
let pastGuessesHTML = "";
let futureGuessesHTML = "";
let dateEvent;
let link;
let historyHint;

// Event listener for form submission
document.getElementById("date-form").addEventListener("submit", submitGuess);

// Function to handle form submission
function submitGuess(event) {
  event.preventDefault();

  // Get the user's guess
  const digit1 = document.getElementById("digit1").value;
  const digit2 = document.getElementById("digit2").value;
  const digit3 = document.getElementById("digit3").value;
  const digit4 = document.getElementById("digit4").value;
  const digit5 = document.getElementById("digit5").value;
  const digit6 = document.getElementById("digit6").value;
  const digit7 = document.getElementById("digit7").value;
  const digit8 = document.getElementById("digit8").value;

  const guess = `${digit1}${digit2}/${digit3}${digit4}/${digit5}${digit6}${digit7}${digit8}`;

  // Increment the number of attempts
  attempts++;

  // Specify correct message
  var correctMessages = [
    "impossible",
    "magnificent",
    "amazing",
    "great",
    "good",
    "barely",
  ];
  // Check if the guess is correct
  if (guess === correctDate) {
    var correctMessage = correctMessages[attempts - 1];
    result = `<div class="success"><h2>Congratulations! On ${correctDate}, the event was <a href="${link}" target="_blank">${dateEvent}</a></h2><h3>Rank: ${correctMessage}</h3><br>
        <button style="background-color: steelblue" onclick="initializeGame(); clearInputs();">Play again</button></div>`;
    winStatus = true;
  } else {
    const matchingDigits = [];
    const incorrectDigits = [];
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === correctDate[i]) {
        matchingDigits.push(guess[i]);
      } else {
        incorrectDigits.push(guess[i]);
      }
    }
    // Generate the table of past guesses
    for (const pastGuess of guesses) {
      pastGuessesHTML += "<tr>";
      for (let i = 0; i < pastGuess.length; i++) {
        if (pastGuess[i] === correctDate[i]) {
          if (pastGuess[i] === "/") {
            pastGuessesHTML += '<td><span class="slash">/</span></td>';
          } else {
            pastGuessesHTML +=
              '<td><span class="result tile correct">' +
              pastGuess[i] +
              "</span></td>";
          }
        } else if (correctDate.includes(pastGuess[i])) {
          pastGuessesHTML +=
            '<td><span class="result tile close">' +
            pastGuess[i] +
            "</span></td>";
        } else {
          pastGuessesHTML +=
            '<td><span class="result tile incorrect">' +
            pastGuess[i] +
            "</span></td>";
        }
      }
      pastGuessesHTML += "</tr>";
    }
    // Store the guess and its hint
    guesses.push(guess);

    // Check if the maximum number of attempts has been reached
    if (attempts >= maxAttempts) {
      result = `<div class="fail"><h2>Sorry, you have reached the maximum number of attempts.<br><br>The correct date is ${correctDate}, and the event was <a href="${link}" target="_blank">${dateEvent}</a></h2><br><br>
          <button type="submit" style="background-color: steelblue" onclick="initializeGame(); clearInputs();">Try again</button></div>`;
      failStatus = true;
    }
  }
  // Update the display
  updateDisplay();

  // Reset the form
  //    document.getElementById('date-form').reset();
}

// Function to initialize the game
async function initializeGame() {
  // Clear previous data
  randomEntry = await getDate();
  const date = new Date(randomEntry.date);
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
  correctDate = formattedDate;
  dateEvent = randomEntry.event;
  link = randomEntry.link;
  historyHint = randomEntry.hint;
  result = "";
  winStatus = false;
  failStatus = false;
  guesses = [];
  hints = [];
  attempts = 0;
  // Season hint
  var month = correctDate.split("/")[0];
  seasonHint = "";

  switch (month) {
    case "01":
    case "02":
    case "03":
      seasonHint = "January to March";
      break;
    case "04":
    case "05":
    case "06":
      seasonHint = "April to June";
      break;
    case "07":
    case "08":
    case "09":
      seasonHint = "July to September";
      break;
    default:
      seasonHint = "October to December";
      break;
  }
  // Update the display
  updateDisplay();
}

// Function to update the display
function updateDisplay() {
  let pastGuessesHTML = ""; // Declare the variable here
  let futureGuessesHTML = ""; // Declare the variable here
  let testPast = 0;
  // Generate the table of past guesses
  for (const pastGuess of guesses) {
    console.log("pastGuess:", pastGuess); // Debugging
    pastGuessesHTML += "<tr>";
    for (let i = 0; i < pastGuess.length; i++) {
      if (pastGuess[i] === correctDate[i]) {
        if (pastGuess[i] === "/") {
          pastGuessesHTML += '<td><span class="slash">/</span></td>';
        } else {
          pastGuessesHTML +=
            '<td><span class="result tile correct">' +
            pastGuess[i] +
            "</span></td>";
        }
      } else if (correctDate.includes(pastGuess[i])) {
        pastGuessesHTML +=
          '<td><span class="result tile close">' +
          pastGuess[i] +
          "</span></td>";
      } else {
        pastGuessesHTML +=
          '<td><span class="result tile incorrect">' +
          pastGuess[i] +
          "</span></td>";
      }
    }
    pastGuessesHTML += "</tr>";

    testPast++;
  }

  // Generate the table of future guesses
  for (let i = 1; i < maxAttempts - attempts; i++) {
    futureGuessesHTML +=
      '<tr><td><span class="result tile"></span></td><td><span class="result tile"></span></td><td><span class="slash">/</span></td><td><span class="result tile"></span></td><td><span class="result tile"></span></td><td><span class="slash">/</span></td><td><span class="result tile"></span></td><td><span class="result tile"></span></td><td><span class="result tile"></span></td><td><span class="result tile"></span></td>';
    futureGuessesHTML += "</tr>";
  }
  //populate the elements
  document.getElementById("pastguesses").innerHTML =
    "<table><tbody>" + pastGuessesHTML + "</tbody></table>";
  document.getElementById("futureguesses").innerHTML =
    "<table><tbody>" + futureGuessesHTML + "</tbody></table>";
  document.getElementById("result").innerHTML = result;
  //document.getElementById('answer').innerHTML = 'Test: ' + testPast + 'Answer: ' + correctDate + ', event: ' + dateEvent + 'link: ' + link + 'hint' + historyHint;
  //set hints
  document.getElementById("historyHint").innerHTML =
    "History hint: " + historyHint;
  document.getElementById("seasonHint").innerHTML =
    "Season hint: " + seasonHint;
  // Scroll to the bottom of the guesses container
  const guessesContainer = document.getElementById("pastguesses");
  guessesContainer.scrollTop = guessesContainer.scrollHeight;
  if (attempts >= 2) {
    document.getElementById("hintSection").style.display = "block";
  }
  // Don't show the input form if the result is won or failed
  const dateFormDiv = document.getElementById("date-form");
  dateFormDiv.style.display = winStatus || failStatus ? "none" : "block";
}

// Function to generate a random date
function getDate() {
  return fetch("dates.json")
    .then((response) => response.json())
    .then((data) => {
      // Get a random index from the array
      const randomIndex = Math.floor(Math.random() * data.length);

      // Use the random index to get a random entry from the array
      const randomEntry = data[randomIndex];

      // Extract the date from the entry
      return randomEntry;
    })
    .catch((error) => {
      console.error("Error fetching JSON data:", error);
    });
}
//open infoModal
window.onload = function () {
  var modal = document.getElementById("infoModal");
  var btn = document.getElementById("openinfoModal");
  var span = document.getElementsByClassName("closeinfoModel")[0];

  btn.onclick = function () {
    modal.style.display = "block";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};
//function to clear inputs on reset button
function clearInputs() {
  var inputFields = document.getElementsByClassName("inputDigit");
  for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].value = "";
  }
  location.reload();
}
//prevents text from being entered
function isNumberKey(evt) {
  var charCode = evt.which ? evt.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    evt.preventDefault();
    return false;
  }
  return true;
}
//automatically go to next input
// Select all elements with the class "inputDigit"
const inputFields = document.querySelectorAll(".inputDigit");

// Loop through each input field and add an event listener to it
for (let i = 0; i < inputFields.length; i++) {
  inputFields[i].addEventListener("input", function () {
    // Check if the length of the input value is equal to the maximum length of the input field
    if (this.value.length == this.maxLength) {
      // Get the index of the current input field in the array of input fields
      const index = Array.prototype.indexOf.call(inputFields, this);

      // Check if the current input field is not the last one in the array
      if (index !== inputFields.length - 1) {
        // Set the focus to the next input field
        inputFields[index + 1].focus();
      }
    }
  });
}
// Initialize the game
initializeGame(); // Function to automatically select all text in the input field
function selectText(element) {
  element.setSelectionRange(0, element.value.length);
}

// Add event listeners to input fields to trigger automatic text selection
for (let i = 0; i < inputFields.length; i++) {
  inputFields[i].addEventListener("click", function () {
    selectText(this);
  });

  inputFields[i].addEventListener("focus", function () {
    selectText(this);
  });
}
//hints
function showHints(hint) {
  document.getElementById("hints").style.display = "block";
  document.getElementById(hint).style.display = "block";
  document.getElementById("hintSection").style.display = "none";
  document.getElementById(hint + "Button").style.display = "none";
}
function sendWhenGuess() {
  // Retrieve the most recently submitted date (replace 'mostRecentDate' with the actual value)
  //var mostRecentDate = "2023-05-18"; // Example date
  var correctDateObj = new Date(correctDate);
  //var correctDate = "2023-05-19"; // Replace with your actual correct date
  var lastGuess = guesses[guesses.length - 1];
  var lastGuessObj = new Date(lastGuess);
  // Compare the correctDate with the most recently submitted date
  if (correctDateObj > lastGuessObj) {
    document.getElementById("whenHint").innerHTML =
      "When hint: The correct date is after " + lastGuess + ".";
  } else if (correctDateObj < lastGuessObj) {
    document.getElementById("whenHint").innerHTML =
      "When hint: The correct date is before " + lastGuess + ".";
  } else {
    document.getElementById("whenHint").innerHTML =
      "When hint: The correct date is the same as " + lastGuess + ".";
  }
  // Show the hint and hide the button
  showHints("whenHint");
  document.getElementById("whenHintButton").style.display = "none";
}
// Toggle Night Mode
function toggleNightMode() {
  const darkStyleLink = document.getElementById("darkStyle");
  if (darkStyleLink) {
    // If darkstyle.css is already included, remove it
    darkStyleLink.remove();
    // Remove the preference from local storage
    localStorage.removeItem("night-mode-preference");
  } else {
    // If darkstyle.css is not included, include it
    const darkStyleLink = document.createElement("link");
    darkStyleLink.rel = "stylesheet";
    darkStyleLink.href = "style/darkstyle.css";
    darkStyleLink.id = "darkStyle";
    document.head.appendChild(darkStyleLink);
    // Set the preference in local storage
    localStorage.setItem("night-mode-preference", "enabled");
  }
}

// Set night mode by default if the preference is not saved or it's set to "enabled"
if (!nightModePreference || nightModePreference === "enabled") {
  const darkStyleLink = document.createElement("link");
  darkStyleLink.rel = "stylesheet";
  darkStyleLink.href = "style/darkstyle.css";
  darkStyleLink.id = "darkStyle";
  document.head.appendChild(darkStyleLink);
}

// Add event listener to the button
const nightModeButton = document.getElementById("nightModeButton");
nightModeButton.addEventListener("click", toggleNightMode);
