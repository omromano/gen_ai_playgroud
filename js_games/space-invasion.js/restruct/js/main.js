let game;
let spaceBarCount = 0;

function startGame() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas, config);
    game.render();
    // requestAnimationFrame(game.update.bind(game));

    window.addEventListener('keydown', (event) => {
        game.handleInput(event);
    });
    window.addEventListener('keyup', (event) => {
        game.handleKeyUp(event);
    });
    requestAnimationFrame(game.update.bind(game));
}