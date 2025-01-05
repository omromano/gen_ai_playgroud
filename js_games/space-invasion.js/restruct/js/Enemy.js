class Enemy {
    constructor(x, y, width, height, row, config) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = true;
        this.row = row;
        this.config = config;
    }

    update(deltaTime, moveDirection, movementSpeed) {
        this.x += movementSpeed * moveDirection * this.config.gameWidth * deltaTime;
    }

    drop(deltaTime) {
        this.y += (this.config.gameHeight * this.config.enemyDropOnDirectionChange);
    }

    render(ctx) {
        if (this.alive) {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}