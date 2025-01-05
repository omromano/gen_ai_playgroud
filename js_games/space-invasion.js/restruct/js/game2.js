class Game {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.canvas.width = this.config.gameWidth;
        this.canvas.height = this.config.gameHeight;
        this.gameState = 'start'; // start, playing, gameover, win
        this.lastTime = 0;
        this.enemyMoveDirection = 1;
        this.timeSinceSpeedIncrease = 0;
        this.timeSinceBombDrop = 0;
        this.timeSinceLastBolt = 0;
        this.stageTransitionTimer = 0;
        this.isPaused = false;
        this.escPressCount = 0;
        this.playerLives = 3;
        this.enemies = [];
        this.bombs = [];
        this.bolts = [];
        this.castles = [];
        this.playerShip = null;
        this.score = new Score();
        this.enemyMovementSpeed = this.config.enemyStartMovementSpeed;
        this.bombDropInterval = this.config.bombDropIntervalStart;
        this.spaceBarCount = 0;
        this.renderInterval = null;
    }

    initializeGame() {
        this.enemies = this.createEnemies();
        this.castles = this.createCastles();
        this.playerShip = this.createPlayerShip();
        this.bombs = [];
        this.bolts = [];
        this.enemyMoveDirection = 1;
        this.timeSinceSpeedIncrease = 0;
        this.timeSinceBombDrop = 0;
        this.timeSinceLastBolt = 0;
        this.gameState = 'playing';
        this.enemyMovementSpeed = this.config.enemyStartMovementSpeed;// added this line
        if (this.renderInterval) {
            clearInterval(this.renderInterval);
        }

        this.renderInterval = setInterval(() => {
            this.render();
        }, 100);

    }

    resetGame() {
        this.enemyMovementSpeed *= (1 + this.config.enemySpeedIncreaseOnStageWin);
        this.initializeGame();
    }


    createEnemies() {
        const enemies = [];
        const enemyWidth = ((this.config.gameWidth * 0.8) / (this.config.enemiesPerRow + (this.config.enemiesPerRow / 4) + (this.config.enemiesPerRow / 12))) * (1 - this.config.enemySizeReduction);
        const enemyHeight = ((this.config.enemyAreaHeight * this.config.gameHeight * 0.8) / this.config.enemyRows) * (1 - this.config.enemySizeReduction);

        for (let row = 0; row < this.config.enemyRows; row++) {
            for (let col = 0; col < this.config.enemiesPerRow; col++) {
                const x = (this.config.gameWidth * 0.1) + col * ((this.config.gameWidth * 0.8) / (this.config.enemiesPerRow + (this.config.enemiesPerRow / 4) + (this.config.enemiesPerRow / 12))) + Math.floor(col / 4) * ((this.config.gameWidth * 0.8) / (this.config.enemiesPerRow + (this.config.enemiesPerRow / 4) + (this.config.enemiesPerRow / 12))) * this.config.enemyHorizontalSpace;
                const y = this.config.textAreaHeight * this.config.gameHeight + row * ((this.config.enemyAreaHeight * this.config.gameHeight * 0.8) / this.config.enemyRows) + row * ((this.config.enemyAreaHeight * this.config.gameHeight * 0.8) / this.config.enemyRows) * this.config.enemyVerticalSpace;
                enemies.push(new Enemy(
                    x + enemyWidth * this.config.enemySizeReduction / 2,
                    y + enemyHeight * this.config.enemySizeReduction / 2,
                    enemyWidth,
                    enemyHeight,
                    row,
                    this.config
                ));
            }
        }
        return enemies;
    }
    createCastles() {
        const castles = [];
        const castleWidth = (this.config.gameWidth * 0.7) / this.config.castleCount;
        const castleHeight = this.config.castleAreaHeight * this.config.gameHeight * 0.8;
        const castleSpace = (this.config.gameWidth * 0.3) / (this.config.castleCount + 1);

        for (let i = 0; i < this.config.castleCount; i++) {
            const x = castleSpace + i * (castleWidth + castleSpace);
            const y = this.config.textAreaHeight * this.config.gameHeight + this.config.enemyAreaHeight * this.config.gameHeight + (this.config.castleAreaHeight * this.config.gameHeight - castleHeight) / 2;
            castles.push(new Castle(
                x,
                y,
                castleWidth,
                castleHeight,
                this.config
            ));
        }
        return castles;
    }


    createPlayerShip() {
        const playerWidth = this.config.gameWidth * 0.1;
        const playerHeight = this.config.playerAreaHeight * this.config.gameHeight * 0.8;
        return new Player(
            (this.config.gameWidth - playerWidth) / 2,
            this.config.textAreaHeight * this.config.gameHeight + this.config.enemyAreaHeight * this.config.gameHeight + this.config.castleAreaHeight * this.config.gameHeight + (this.config.playerAreaHeight * this.config.gameHeight - playerHeight) / 2,
            playerWidth,
            playerHeight,
            0.3,
            this.config
        );
    }

    update(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.gameState === 'win') {
            this.stageTransitionTimer -= deltaTime;
            if (this.stageTransitionTimer <= 0) {
                this.resetGame();
            }

            requestAnimationFrame(this.update.bind(this));
            return;
        }

        if (this.isPaused) {

            requestAnimationFrame(this.update.bind(this));
            return;
        }

        if (this.gameState !== 'playing') return;

        this.timeSinceLastBolt += deltaTime;
        this.updateEnemies(deltaTime);
        this.updateBombs(deltaTime);
        this.updateBolts(deltaTime);
        this.updatePlayer(deltaTime);
        this.checkCollisions();
        this.checkGameOver();
        this.timeSinceSpeedIncrease += deltaTime;
        if (this.timeSinceSpeedIncrease >= this.config.enemySpeedIncreaseInterval) {
            this.enemyMovementSpeed += this.config.enemySpeedIncreaseRate;
            this.timeSinceSpeedIncrease = 0;
        }

        this.timeSinceBombDrop += deltaTime;
        if (this.timeSinceBombDrop >= this.bombDropInterval) {
            this.dropBomb();
            this.timeSinceBombDrop = 0;
        }
        this.timeSinceBombDropIncrease += deltaTime;
        if (this.timeSinceBombDropIncrease >= this.config.bombDropIntervalIncreaseInterval) {
            this.bombDropInterval += this.config.bombDropIntervalIncreaseRate;
            this.timeSinceBombDropIncrease = 0;
        }

        if (this.allEnemiesDestroyed()) {
            this.gameState = 'win';
            this.stageTransitionTimer = this.config.stageTransitionTime;
            this.score.saveScore();

        }

        requestAnimationFrame(this.update.bind(this));
    }


    updateEnemies(deltaTime) {
        let shouldDrop = false;
        let leftMostEnemy = this.config.gameWidth;
        let rightMostEnemy = 0;

        for (const enemy of this.enemies) {
            if (enemy.alive) {
                enemy.update(deltaTime, this.enemyMoveDirection, this.enemyMovementSpeed);
                leftMostEnemy = Math.min(leftMostEnemy, enemy.x);
                rightMostEnemy = Math.max(rightMostEnemy, enemy.x + enemy.width)
            }

        }

        if (leftMostEnemy <= (this.config.gameWidth * 0.01) && this.enemyMoveDirection === -1) {
            this.enemyMoveDirection = 1;
            shouldDrop = true;
        }
        if (rightMostEnemy >= (this.config.gameWidth * 0.99) && this.enemyMoveDirection === 1) {
            this.enemyMoveDirection = -1;
            shouldDrop = true;
        }

        if (shouldDrop) {
            for (const enemy of this.enemies) {
                if (enemy.alive) {
                    enemy.drop(deltaTime);
                }
            }
        }
    }
    updateBombs(deltaTime) {
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.y += 0.4 * this.config.gameHeight * deltaTime;
            if (bomb.y > this.config.gameHeight) {
                this.bombs.splice(i, 1);
            }
        }
    }
    updateBolts(deltaTime) {
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            bolt.y -= 0.8 * this.config.gameHeight * deltaTime;
            if (bolt.y < 0) {
                this.bolts.splice(i, 1);
            }
        }
    }

    updatePlayer(deltaTime) {
        this.playerShip.update(deltaTime)
    }

    dropBomb() {
        const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length > 0) {
            const randomIndex = Math.floor(Math.random() * aliveEnemies.length);
            const enemy = aliveEnemies[randomIndex];
            this.bombs.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height,
                width: this.config.gameWidth * 0.02,
                height: this.config.gameHeight * 0.02,
            });
        }
    }

    checkCollisions() {
        // Bolt and Enemy Collision
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (enemy.alive && this.checkCollision(bolt, enemy)) {
                    enemy.alive = false;
                    this.score.addScore((this.config.enemyRows - enemy.row) * 10);
                    this.bolts.splice(i, 1);
                    break;
                }
            }
        }

        // Bolt and Castle collision
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            for (let j = this.castles.length - 1; j >= 0; j--) {
                const castle = this.castles[j];
                if (castle.hitPoints > 0) {
                    const collision = this.checkCollision(bolt, castle);
                    if (collision) {
                        castle.reduceSize(bolt.x, bolt.y);
                        this.bolts.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // Enemy and Castle Collision
        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (enemy.alive) {
                for (let k = this.castles.length - 1; k >= 0; k--) {
                    const castle = this.castles[k];
                    if (castle.alive && this.checkCollision(enemy, castle)) {
                        castle.alive = false;
                        this.castles.splice(k, 1);
                        enemy.alive = false;
                        break;
                    }
                }
            }
        }

        // Enemy and Player Collision
        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const enemy = this.enemies[j];
            if (enemy.alive) {
                if (this.checkCollision(enemy, this.playerShip)) {
                    this.gameState = 'gameover';
                    this.score.saveScore();
                    this.score.reset();
                    break;
                }
            }
        }

        // Bomb and Castle Collision
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            for (let j = this.castles.length - 1; j >= 0; j--) {
                const castle = this.castles[j];
                if (castle.hitPoints > 0) {
                    const collision = this.checkCollision(bomb, castle);
                    if (collision) {
                        castle.reduceSize(bomb.x, bomb.y);
                        this.bombs.splice(i, 1);
                        break;
                    }
                }
            }
        }
        // Bomb and Player Ship Collision
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            if (this.checkCollision(bomb, this.playerShip)) {
                this.playerLives--;
                this.bombs.splice(i, 1);
                if (this.playerLives <= 0) {
                    this.gameState = 'gameover';
                    this.score.saveScore();
                    this.score.reset();
                }
            }
        }
    }

    checkCollision(rect1, rect2) {

        let collision = (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );

        if (collision && rect2.hitAreas) {
            for (const hitArea of rect2.hitAreas) {
                if (rect1.x < rect2.x + hitArea.x + hitArea.width &&
                    rect1.x + rect1.width > rect2.x + hitArea.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y) {
                    return false;
                }
            }
        }


        return collision;
    }


    checkGameOver() {
        if (this.gameState === 'gameover' || this.gameState === 'win') {
            return;
        }

    }


    allEnemiesDestroyed() {
        return this.enemies.every(enemy => !enemy.alive);
    }

    render() {
        this.ctx.clearRect(0, 0, this.config.gameWidth, this.config.gameHeight);
        this.renderText();
        if (this.gameState === 'playing') {
            this.renderEnemies();
            this.renderCastles();
            this.renderPlayerShip();
            this.renderBombs();
            this.renderBolts();

        } else if (this.gameState === 'start') {
            this.score.renderHighScores(this.ctx, this.config.gameWidth, this.config.gameHeight);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Press SPACEBAR to start", this.config.gameWidth / 2, this.config.gameHeight * 3 / 4);
        }
        else if (this.gameState === 'gameover') {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '30px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("GAME OVER", this.config.gameWidth / 2, this.config.gameHeight / 2);
            this.ctx.font = '20px sans-serif';
            this.ctx.fillText("Press SPACEBAR twice to play again", this.config.gameWidth / 2, this.config.gameHeight / 2 + 40);
        }
        else if (this.gameState === 'win') {
            this.ctx.fillStyle = 'green';
            this.ctx.font = '30px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("Stage Complete! Next Stage in: " + this.stageTransitionTimer.toFixed(1), this.config.gameWidth / 2, this.config.gameHeight / 2);
        } else if (this.isPaused) {
            this.ctx.fillStyle = 'yellow';
            this.ctx.font = '30px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("PAUSED", this.config.gameWidth / 2, this.config.gameHeight / 2);

        }
    }

    renderText() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Lives: ${this.playerLives} | Score: ${this.score.getScore()} | State: ${this.gameState}`, 10, 20);
    }

    renderEnemies() {
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
    }

    renderCastles() {
        for (const castle of this.castles) {
            castle.render(this.ctx);
        }
    }


    renderPlayerShip() {
        this.playerShip.render(this.ctx);
    }

    renderBombs() {
        this.ctx.fillStyle = 'yellow';
        for (const bomb of this.bombs) {
            this.ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
        }
    }
    renderBolts() {
        this.ctx.fillStyle = 'cyan';
        for (const bolt of this.bolts) {
            this.ctx.fillRect(bolt.x - 2.5, bolt.y, 5, 15);
        }
    }

    handleInput(event) {
        if (event.code === 'Space') {
            if (this.gameState === 'win' || this.gameState === 'gameover') {
                this.escPressCount = 0;
                this.spaceBarCount++;
                if (this.spaceBarCount >= 2) {
                    if (this.gameState === 'start' || this.gameState === 'gameover') {
                        this.playerLives = 3;
                    }
                    this.initializeGame();
                    this.spaceBarCount = 0;

                    requestAnimationFrame(this.update.bind(this));
                }
            } else if (this.isPaused) {
                this.escPressCount = 0;
                this.isPaused = false;
            }
            else if (this.gameState === 'start') {
                this.escPressCount = 0;
                this.spaceBarCount++;
                if (this.spaceBarCount >= 2) {
                    if (this.gameState === 'start' || this.gameState === 'gameover') {
                        this.playerLives = 3;
                    }
                    this.initializeGame();
                    this.spaceBarCount = 0;
                    requestAnimationFrame(this.update.bind(this));
                }
            } else {
                if (this.timeSinceLastBolt >= this.config.boltFireInterval) {
                    this.bolts.push({
                        x: this.playerShip.x + this.playerShip.width / 2,
                        y: this.playerShip.y,
                        width: 5,
                        height: 15,
                    });
                    this.timeSinceLastBolt = 0;
                }
            }
        }
        if (this.gameState === 'playing') {
            if (event.code === 'ArrowLeft') {
                this.playerShip.moveLeft = true;
            }
            if (event.code === 'ArrowRight') {
                this.playerShip.moveRight = true;
            }
        }


        if (event.code === 'Escape') {
            this.escPressCount++;
            if (this.escPressCount === 1 && this.gameState === 'playing') {
                this.isPaused = true;

            } else if (this.escPressCount >= 2) {
                this.gameState = 'start';
                this.isPaused = false;
                this.escPressCount = 0;
            }

        }
    }


    handleKeyUp(event) {
        if (this.gameState === 'playing') {
            if (event.code === 'ArrowLeft') {
                this.playerShip.moveLeft = false;
            }
            if (event.code === 'ArrowRight') {
                this.playerShip.moveRight = false;
            }
        }
    }
}