const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust canvas size dynamically
canvas.width = Math.min(window.innerWidth * 0.8, 600);
canvas.height = Math.min(window.innerWidth * 0.8, 600);

const boxSize = 20; // Each block size
let snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
let food = { x: randomPosition(), y: randomPosition() };
let direction = "RIGHT";
let score = 0;
let speed = 120;
let gameInterval;

// Google Form URL to submit high scores
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/<your-form-id>/formResponse"; // Replace with actual form ID

// Randomize food position
function randomPosition() {
    return Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize;
}

// Draw Snake
function drawSnake() {
    ctx.fillStyle = "green";
    ctx.strokeStyle = "black";
    snake.forEach(part => {
        ctx.fillRect(part.x, part.y, boxSize, boxSize);
        ctx.strokeRect(part.x, part.y, boxSize, boxSize);
    });
}

// Draw Food
function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// Move Snake
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === "UP") head.y -= boxSize;
    if (direction === "DOWN") head.y += boxSize;
    if (direction === "LEFT") head.x -= boxSize;
    if (direction === "RIGHT") head.x += boxSize;

    // Game Over condition
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width || head.y >= canvas.height ||
        snake.some(part => part.x === head.x && part.y === head.y)
    ) {
        clearInterval(gameInterval);
        showGameOver();
        return;
    }

    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 1; // Only add 1 point per food
        document.getElementById("score").innerText = `Score: ${score}`;
        food = { x: randomPosition(), y: randomPosition() };
        adjustSpeed();
    } else {
        snake.pop();
    }
}

// Change Direction
document.addEventListener("keydown", event => {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Restart Game
document.getElementById("restartButton").addEventListener("click", startGame);

// Start Game
function startGame() {
    snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
    direction = "RIGHT";
    food = { x: randomPosition(), y: randomPosition() };
    score = 0;
    speed = 120;
    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("gameOver").style.display = "none";
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, speed);
}

// Adjust Speed
function adjustSpeed() {
    clearInterval(gameInterval);
    speed = Math.max(30, speed - 5); // Decrease speed (minimum: 30ms)
    gameInterval = setInterval(updateGame, speed);
}

// Game Over
function showGameOver() {
    document.getElementById("gameOver").style.display = "block";
    showHighScoreModal();
}

// High Score Modal
function showHighScoreModal() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("saveHighScoreModal").style.display = "block";
    document.getElementById("highScoreDisplay").innerText = score;
}

// View High Scores
document.getElementById("viewHighScoresButton").addEventListener("click", () => {
    const highScoresModal = document.getElementById("highScoresModal");
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    highScoresModal.style.display = "block";

    // Fetch high scores from Google Sheets
    const highScoresList = document.getElementById("highScoresList");
    highScoresList.innerHTML = ""; // Clear existing list
    fetchHighScoresFromGoogleSheets(highScoresList);
});

// Close High Scores Modal
document.getElementById("closeHighScoresButton").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("highScoresModal").style.display = "none";
});

// Close High Score Modal (Cancel without submission)
document.getElementById("cancelHighScoreButton").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("saveHighScoreModal").style.display = "none";
    startGame();  // Restart the game without submitting high score
});


// Save High Score
document.getElementById("submitHighScoreButton").addEventListener("click", () => {
    const playerName = document.getElementById("playerName").value.trim();
    if (playerName) {
        submitHighScoreToGoogleForm(playerName, score);
        document.getElementById("overlay").style.display = "none";
        document.getElementById("saveHighScoreModal").style.display = "none";
        startGame();
    } else {
        alert("Please enter your name!");
    }
});


function submitHighScoreToGoogleForm(playerName, score) {
    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd8oX7iBdx06N6LAfd2tuV6WYeN6FSpVfydFqtzW9KTYolwrg/formResponse"; // Your Google Form's POST URL
  
    // Create FormData object
    const formData = new FormData();
    formData.append("entry.2134714440", playerName); // Name field
    formData.append("entry.914075395", score);       // Score field
  
    // Send the data to Google Forms using fetch
    fetch(formUrl, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    })
      .then(() => {
        console.log("Form submitted successfully!");
        alert("Your score has been submitted!");
      })
      .catch((error) => {
        console.error("Error submitting the form:", error);
      });
  }

// Fetch High Scores from Google Sheets
function fetchHighScoresFromGoogleSheets(highScoresList) {
    fetch("https://docs.google.com/spreadsheets/d/e/1NPK31SgXRvw_vRGUcx6ct5kmZmFtvPElyHBvwx8yceU/pub?output=csv") // Replace with your actual sheet ID
        .then(response => response.text())
        .then(data => {
            const rows = data.split("\n").slice(1); // Remove header row
            rows.forEach(row => {
                const [name, score] = row.split(","); // Assumes "Name,Score" format
                const li = document.createElement("li");
                li.innerText = `${name}: ${score}`;
                highScoresList.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Failed to fetch high scores:", err);
            alert("Failed to load high scores.");
        });
}

// Game Update
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    moveSnake();
}

// Initialize Game
startGame();
