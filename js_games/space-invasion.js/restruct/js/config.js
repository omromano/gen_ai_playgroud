// let config = {
//     "gameWidth": 800,
//     "gameHeight": 600,
//     "textAreaHeight": 0.05,
//     "enemyAreaHeight": 0.75,
//     "castleAreaHeight": 0.1,
//     "playerAreaHeight": 0.1,
//     "enemyRows": 8,
//     "enemiesPerRow": 12,
//     "enemyHorizontalSpace": 0.2,
//     "enemyVerticalSpace": 0.1,
//     "enemyStartMovementSpeed": 0.01,
//     "enemySpeedIncreaseRate": 0.005,
//     "enemySpeedIncreaseInterval": 20,
//     "bombDropIntervalStart": 1,
//     "bombDropIntervalIncreaseRate": 0.1,
//     "bombDropIntervalIncreaseInterval": 10,
//     "castleCount": 5,
//     "enemySizeReduction": 0.1,
//     "boltFireInterval": 0.5,
//     "castleHitReduction": 10,
//     "stageTransitionTime": 3,
//     "enemySpeedIncreaseOnStageWin": 0.3,
//     "enemyDropOnDirectionChange": 0.05
// }


let config;

fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        // Initialize game after loading the config
        startGame();
    })
    .catch(error => {
        console.error('Error loading config.json:', error);
        config = {
            "gameWidth": 800,
            "gameHeight": 600,
            "textAreaHeight": 0.05,
            "enemyAreaHeight": 0.75,
            "castleAreaHeight": 0.1,
            "playerAreaHeight": 0.1,
            "enemyRows": 8,
            "enemiesPerRow": 12,
            "enemyHorizontalSpace": 0.2,
            "enemyVerticalSpace": 0.1,
            "enemyStartMovementSpeed": 0.01,
            "enemySpeedIncreaseRate": 0.005,
            "enemySpeedIncreaseInterval": 20,
            "bombDropIntervalStart": 1,
            "bombDropIntervalIncreaseRate": 0.1,
            "bombDropIntervalIncreaseInterval": 10,
            "castleCount": 5,
            "enemySizeReduction": 0.1,
            "boltFireInterval": 0.5,
            "castleHitReduction": 10,
            "stageTransitionTime": 3,
            "enemySpeedIncreaseOnStageWin": 0.3,
            "enemyDropOnDirectionChange": 0.05
        };
        startGame();
    });