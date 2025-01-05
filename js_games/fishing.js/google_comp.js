<!DOCTYPE html>
<html>
<head>
<title>Fishing Game</title>
<style>
body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: lightblue;}
canvas { border: 1px solid black; }
#message { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2em; background-color: rgba(255, 255, 255, 0.7); padding: 20px; border-radius: 10px; }
</style>
</head>
<body>
<canvas id="gameCanvas" width="800" height="400"></canvas>
<div id="message">Press Space to Start</div>
<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');

const waterHeight = canvas.height * 0.8;
const rowHeight = waterHeight / 4;
let gameStarted = false;
let gameOver = false;
let score = 0;
let timer = 60;
let timerInterval;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let fishes = [];
let hookY = canvas.height * 0.1;
let hookSpeed = 5;

function drawBackground() {
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.2);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, canvas.height * 0.2, canvas.width, waterHeight);
}

function drawHook() {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height * 0.2);
    ctx.lineTo(canvas.width / 2, hookY);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, hookY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
}

function createFish() {
    if (fishes.length < 5) {
        let row = Math.floor(Math.random() * 4);
        let speed = Math.random() * 3 + 1; // Speed between 1 and 4
        fishes.push({
            x: Math.random() < 0.5 ? -20 : canvas.width + 20,
            y: canvas.height * 0.2 + row * rowHeight + rowHeight / 2,
            speed: speed,
            direction: Math.random() < 0.5 ? 1 : -1,
            row: row,
            width: 30,
            height: 15
        });
    }
}

function drawFishes() {
    for (let i = 0; i < fishes.length; i++) {
        let fish = fishes[i];
        ctx.fillStyle = 'orange';
        ctx.fillRect(fish.x, fish.y - fish.height/2, fish.width, fish.height);
        fish.x += fish.speed * fish.direction;
        if ((fish.x > canvas.width + fish.width && fish.direction == 1) || (fish.x < -fish.width && fish.direction == -1)) {
            if(Math.abs(fish.x) > fish.width)
            fishes.splice(i, 1);
        }
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawHook();
    drawFishes();

    if (fishes.length < 5) {
        if (Math.random() < 0.02)
            createFish();
    }

    if (gameOver) {
        clearInterval(timerInterval);
        displayGameOver();
        return;
    }

    requestAnimationFrame(updateGame);
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    timer = 60;
    fishes = [];
    messageDiv.style.display = 'none';
    timerInterval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            gameOver = true;
        }
    }, 1000);
    updateGame();
}

function displayGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '2em Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);

    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 10);
    localStorage.setItem('highScores', JSON.stringify(highScores));

    ctx.fillText("High Scores:", canvas.width / 2, canvas.height / 2 + 50);
    for (let i = 0; i < Math.min(3, highScores.length); i++) {
        ctx.fillText(`${i+1}. ${highScores[i]}`, canvas.width / 2, canvas.height / 2 + 80 + i * 20);
    }

    messageDiv.textContent = 'Press Space to Restart';
    messageDiv.style.display = 'block';
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            startGame();
        } else {
            let caught = false;
            for (let i = 0; i < fishes.length; i++) {
                let fish = fishes[i];
                if (Math.abs(fish.y - hookY) < fish.height/2 && Math.abs(fish.x - canvas.width/2) < fish.width/2) {
                    score += Math.round(fish.speed*2);
                    fishes.splice(i, 1);
                    caught = true;
                    break;
                }
            }
            if(!caught) score = Math.max(0, score - 1)
        }
    }
    if (gameStarted && !gameOver) {
        if (e.key === 'ArrowUp' && hookY > canvas.height * 0.2) {
            hookY -= hookSpeed;
        } else if (e.key === 'ArrowDown' && hookY < waterHeight + canvas.height*0.2 - 5) {
            hookY += hookSpeed;
        }
    }
});
</script>
</body>
</html>