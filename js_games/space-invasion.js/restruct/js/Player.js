class Player {
    constructor(x, y, width, height, speed, config) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.moveLeft = false;
        this.moveRight = false;
        this.config = config;
    }

    update(deltaTime) {
        if (this.moveLeft) this.x -= this.speed * this.config.gameWidth * deltaTime;
        if (this.moveRight) this.x += this.speed * this.config.gameWidth * deltaTime;
        this.x = Math.max(0, Math.min(this.x, this.config.gameWidth - this.width));
    }

    render(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}