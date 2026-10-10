
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const overlay = document.getElementById("game-overlay");
const messageElement = document.getElementById("game-message");
const startButton = document.getElementById("start-button");

const tileSize = 18;
const tileCount = canvas.width / tileSize;
const gameSpeed = 120;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameRunning = false;
let gameOver = false;
let gameTimer = null;

let bestScore = Number(localStorage.getItem("snakeBestScore")) || 0;
bestScoreElement.textContent = bestScore;

function startGame() {
    clearInterval(gameTimer);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    gameRunning = true;

    scoreElement.textContent = score;
    overlay.classList.add("hidden");

    spawnFood();
    drawGame();

    gameTimer = setInterval(updateGame, gameSpeed);
}

function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (
        snake.some(segment =>
            segment.x === food.x && segment.y === food.y
        )
    );
}

function changeDirection(newDirection) {
    if (!gameRunning || gameOver) return;

    const isOpposite =
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y;

    if (!isOpposite) {
        nextDirection = newDirection;
    }
}

function updateGame() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const eatingFood =
        head.x === food.x && head.y === food.y;

    const bodyToCheck = eatingFood
        ? snake
        : snake.slice(0, -1);

    const hitWall =
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount;

    const hitBody = bodyToCheck.some(segment =>
        segment.x === head.x && segment.y === head.y
    );

    if (hitWall || hitBody) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (eatingFood) {
        score += 10;
        scoreElement.textContent = score;
        updateBestScore();
        spawnFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.fillStyle = "#08111e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#152438";
    ctx.lineWidth = 1;

    for (let i = 0; i <= tileCount; i++) {
        const position = i * tileSize;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvas.width, position);
        ctx.stroke();
    }

    ctx.fillStyle = "#ff5c5c";
    ctx.beginPath();
    ctx.arc(
        food.x * tileSize + tileSize / 2,
        food.y * tileSize + tileSize / 2,
        tileSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#7dff96" : "#38c85a";

        ctx.fillRect(
            segment.x * tileSize + 1,
            segment.y * tileSize + 1,
            tileSize - 2,
            tileSize - 2
        );
    });
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem("snakeBestScore", bestScore);
    }
}

function endGame() {
    clearInterval(gameTimer);
    gameRunning = false;
    gameOver = true;

    messageElement.textContent = "Game Over!";
    startButton.textContent = "Main Lagi";
    overlay.classList.remove("hidden");
}

document.querySelectorAll(".controls button").forEach(button => {
    button.addEventListener("pointerdown", event => {
        event.preventDefault();

        const directions = {
            up:    { x: 0, y: -1 },
            down:  { x: 0, y: 1 },
            left:  { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        changeDirection(directions[button.dataset.direction]);
    });
});

document.addEventListener("keydown", event => {
    const keys = {
        ArrowUp:    { x: 0, y: -1 },
        ArrowDown:  { x: 0, y: 1 },
        ArrowLeft:  { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
    };

    if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
    }
});

startButton.addEventListener("click", startGame);

drawInitialScreen();

function drawInitialScreen() {
    ctx.fillStyle = "#08111e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#152438";

    for (let i = 0; i <= tileCount; i++) {
        const position = i * tileSize;

        ctx.beginPath();
        ctx.moveTo(position, 0);
        ctx.lineTo(position, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, position);
        ctx.lineTo(canvas.width, position);
        ctx.stroke();
    }
}
