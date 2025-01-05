
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startMessage = document.getElementById('start-message');
const gameOverMessage = document.getElementById('game-over-message');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreList = document.getElementById('high-scores-list');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const waterLevel = canvasHeight * 0.2;  // 20% for above water
const rowHeight = (canvasHeight - waterLevel) / 4;

let gameStarted = false;
let gameOver = false;
let score = 0;
let fishArray = [];
let hookY = waterLevel + rowHeight * 2.5;
let timer = 60;
let timerInterval;
const MAX_FISH = 5;

let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function drawBackground() {
    // Draw sky and water
    ctx.fillStyle = '#87ceeb'; // Light sky blue
    ctx.fillRect(0, 0, canvasWidth, waterLevel);
    ctx.fillStyle = '#0077be'; // Deep water blue
    ctx.fillRect(0, waterLevel, canvasWidth, canvasHeight - waterLevel);

    // Draw fishing person
    ctx.fillStyle = '#8b4513'; // Saddle brown
    ctx.fillRect(canvasWidth / 2 - 10, waterLevel - 50, 20, 50); // Body
    ctx.beginPath(); // Head
    ctx.arc(canvasWidth / 2, waterLevel - 50 - 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.moveTo(canvasWidth / 2, waterLevel - 50); // Fishing rod
    ctx.lineTo(canvasWidth / 2 + 80, waterLevel - 80);
    ctx.stroke();

    // Draw fishing line
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 + 80, waterLevel - 80);
    ctx.lineTo(canvasWidth / 2 + 80, hookY);
    ctx.stroke();

    // Draw hook
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.arc(canvasWidth / 2 + 80, hookY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw rows lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, waterLevel + i * rowHeight);
        ctx.lineTo(canvasWidth, waterLevel + i * rowHeight);
        ctx.stroke();
    }
}

class Fish {
    constructor() {
        this.row = Math.floor(Math.random() * 4);
        this.y = waterLevel + (this.row + 0.5) * rowHeight;
        this.speed = 1 + Math.random() * 3;
        this.x = Math.random() < 0.5 ? 0 : canvasWidth;
        this.direction = this.x === 0 ? 1 : -1;
        this.size = 15 + Math.random() * 10;
        this.alive = true;
        this.points = Math.round(this.speed * 2);
    }
    draw() {
        if (!this.alive) return;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x + this.size * 0.4, this.y - this.size * 0.3, this.size * 0.3, this.size * 0.6);
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.5, this.y - this.size * 0.2, 1, 0, Math.PI * 2);
        ctx.fill();

    }

    update() {
        if (!this.alive) return;
        this.x += this.speed * this.direction;
        if (this.x > canvasWidth + this.size || this.x < 0 - this.size) {
            this.alive = false;
        }
    }
}

function generateFish() {
    if (fishArray.length < MAX_FISH && Math.random() < 0.5) {
        fishArray.push(new Fish());
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Time: ' + timer, canvasWidth - 80, 20);

}

function updateHook(event) {
    if (event.key === 'ArrowUp' && hookY > waterLevel) {
        hookY -= rowHeight / 2;
    } else if (event.key === 'ArrowDown' && hookY < canvasHeight - rowHeight / 2) {
        hookY += rowHeight / 2;
    }
}

function checkCatch() {
    let catchedFish = false;
    fishArray.forEach((fish, index) => {
        if (fish.alive && Math.abs(fish.y - hookY) < rowHeight / 2 && Math.abs((canvasWidth / 2 + 80) - fish.x) < fish.size) {
            score += fish.points;
            fish.alive = false;
            catchedFish = true;
        }
    });

    if (!catchedFish) {
        score = Math.max(0, score - 1)
    }
}


function update() {
    if (!gameStarted || gameOver) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBackground();

    fishArray.forEach((fish) => {
        fish.update();
        fish.draw();
    });

    fishArray = fishArray.filter((fish) => fish.alive);
    generateFish();

    drawScore();
    requestAnimationFrame(update);
}

function startGame() {
    startMessage.style.display = 'none';
    gameOverMessage.style.display = 'none';
    gameStarted = true;
    score = 0;
    fishArray = [];
    timer = 60;
    hookY = waterLevel + rowHeight * 2.5;
    update();
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameStarted = false;
    gameOver = true;
    clearInterval(timerInterval);
    gameOverMessage.style.display = 'block';
    finalScoreDisplay.textContent = score;
    updateHighScores();
    displayHighScores();
}

function updateHighScores() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 10);
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function displayHighScores() {
    highScoreList.innerHTML = '';
    highScores.slice(0, 3).forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoreList.appendChild(li);
    });
}

function handleKeyDown(event) {
    if (event.code === 'Space') {
        if (!gameStarted && !gameOver) {
            startGame();
        } else if (gameOver) {
            startGame();
        }
        else {
            checkCatch();
        }
    }
    if (gameStarted)
        updateHook(event);
}


displayHighScores();
document.addEventListener('keydown', handleKeyDown);