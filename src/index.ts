import Game from "./game";
import BasicBrain from "./brains/basic";
import BasicOptimized from "./brains/basicOptimized";

const game = new Game({
    player1Brain: BasicBrain,
    player2Brain: BasicOptimized,
    renderSettings: {
        fullGame: true
    }
})

game.start();

const stats = game.getStats()

console.log(stats);
