
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

let snake = [];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let bestScore = loadBestScore();
let gameRunning = false;
let gameTimer = null;

bestScoreElement.textContent = bestScore;

function loadBestScore() {
    try {
        return Number(localStorage.getItem("snakeBestScore")) || 0;
    } catch {
        return 0;
    }
}

function saveBestScore() {
    try {
        localStorage.setItem("snakeBestScore", String(bestScore));
    } catch {
        return;
    }
}

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
    gameRunning = true;

    scoreElement.textContent = score;
    messageElement.textContent = "Siap Bermain?";
    startButton.textContent = "▶ MULAI GAME";
    overlay.classList.add("hidden");

    spawnFood();
    drawGame();

    gameTimer = setInterval(updateGame, gameSpeed);
}

function spawnFood() {
    const availableCells = [];

    for (let y = 0; y < tileCount; y++) {
        for (let x = 0; x < tileCount; x++) {
            const occupied = snake.some(segment =>
                segment.x === x && segment.y === y
            );

            if (!occupied) {
                availableCells.push({ x, y });
            }
        }
    }

    if (availableCells.length === 0) {
        endGame(true);
        return;
    }

    const randomIndex = Math.floor(
        Math.random() * availableCells.length
    );

    food = availableCells[randomIndex];
}

function changeDirection(newDirection) {
    if (!gameRunning) return;

    const isOpposite =
        newDirection.x === -direction.x &&
        newDirection.y === -direction.y;

    if (isOpposite) return;

    nextDirection = newDirection;
}

function updateGame() {
    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const eatingFood =
        head.x === food.x &&
        head.y === food.y;

    const bodyToCheck = eatingFood
        ? snake
        : snake.slice(0, -1);

    const hitWall =
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount;

    const hitBody = bodyToCheck.some(segment =>
        segment.x === head.x &&
        segment.y === head.y
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

        if (!gameRunning) return;
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#080e19";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawFood();
    drawSnake();
}

function drawGrid() {
    ctx.strokeStyle = "#152438";
    ctx.lineWidth = 0.7;

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

function drawFood() {
    const centerX = food.x * tileSize + tileSize / 2;
    const centerY = food.y * tileSize + tileSize / 2;

    ctx.save();

    ctx.shadowColor = "#ff5470";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ff5470";

    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        tileSize / 2 - 3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * tileSize + 1;
        const y = segment.y * tileSize + 1;
        const size = tileSize - 2;

        ctx.save();

        ctx.fillStyle = index === 0
            ? "#a0ffbd"
            : "#43e879";

        if (index === 0) {
            ctx.shadowColor = "#5cff9d";
            ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 4);
        ctx.fill();

        ctx.restore();

        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

function drawSnakeEyes(head) {
    const centerX = head.x * tileSize + tileSize / 2;
    const centerY = head.y * tileSize + tileSize / 2;

    let eye1;
    let eye2;

    if (direction.x === 1) {
        eye1 = { x: centerX + 4, y: centerY - 4 };
        eye2 = { x: centerX + 4, y: centerY + 4 };
    } else if (direction.x === -1) {
        eye1 = { x: centerX - 4, y: centerY - 4 };
        eye2 = { x: centerX - 4, y: centerY + 4 };
    } else if (direction.y === -1) {
        eye1 = { x: centerX - 4, y: centerY - 4 };
        eye2 = { x: centerX + 4, y: centerY - 4 };
    } else {
        eye1 = { x: centerX - 4, y: centerY + 4 };
        eye2 = { x: centerX + 4, y: centerY + 4 };
    }

    ctx.fillStyle = "#10231a";

    [eye1, eye2].forEach(eye => {
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        saveBestScore();
    }
}

function endGame(won = false) {
    clearInterval(gameTimer);
    gameTimer = null;
    gameRunning = false;

    messageElement.textContent = won
        ? "Kamu Menang!"
        : "Game Over!";

    startButton.textContent = "↻ MAIN LAGI";
    overlay.classList.remove("hidden");
}

const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

document.querySelectorAll(".direction").forEach(button => {
    button.addEventListener("pointerdown", event => {
        event.preventDefault();

        const selectedDirection =
            directions[button.dataset.direction];

        if (selectedDirection) {
            changeDirection(selectedDirection);
        }
    });
});

document.addEventListener("keydown", event => {
    const keyboardDirections = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right"
    };

    const key = keyboardDirections[event.key];

    if (key) {
        event.preventDefault();
        changeDirection(directions[key]);
    }

    if (
        event.key === "Enter" &&
        !gameRunning &&
        document.activeElement !== startButton
    ) {
        startGame();
    }
});

startButton.addEventListener("click", startGame);

function drawInitialScreen() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    food = { x: 15, y: 15 };

    drawGame();
}

drawInitialScreen();
