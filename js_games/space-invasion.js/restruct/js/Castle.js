class Castle {
    constructor(x, y, width, height, config) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitPoints = 100;
        this.hitAreas = [];
        this.alive = true;
        this.config = config;
    }

    reduceSize(x, y) {
        const hitX = x - this.x;
        this.hitPoints -= this.config.castleHitReduction;

        if (this.hitPoints <= 0) return;

        this.hitAreas.push({
            x: hitX,
            hitPoints: this.config.castleHitReduction,
            width: this.width * (this.config.castleHitReduction / 100),
        });
    }
    render(ctx) {
        if (this.alive) {
            ctx.fillStyle = 'grey';
            let currentWidth = this.width;
            ctx.fillRect(this.x, this.y, currentWidth, this.height);
            for (const hitArea of this.hitAreas) {
                currentWidth -= hitArea.width;
                ctx.clearRect(this.x + hitArea.x, this.y, hitArea.width, this.height)
            }


        }
    }
}