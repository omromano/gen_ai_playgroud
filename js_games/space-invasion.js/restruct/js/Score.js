class Score {
    constructor() {
        this.score = 0;
    }

    reset() {
        this.score = 0;
    }

    addScore(points) {
        this.score += points;
    }

    getScore() {
        return this.score;
    }

    saveScore() {
        const highScores = this.getHighScores();
        highScores.push(this.score);
        highScores.sort((a, b) => b - a);
        if (highScores.length > 10) {
            highScores.pop();
        }
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }

    getHighScores() {
        const storedScores = localStorage.getItem('highScores');
        return storedScores ? JSON.parse(storedScores) : [];
    }
    renderHighScores(ctx, gameWidth, gameHeight) {
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        const highScores = this.getHighScores();
        ctx.fillText("High Scores:", gameWidth / 2, gameHeight / 4);

        for (let i = 0; i < highScores.length; i++) {
            ctx.fillText(`${i + 1}. ${highScores[i]}`, gameWidth / 2, gameHeight / 4 + (i + 1) * 20);
        }

    }
}