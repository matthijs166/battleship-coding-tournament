import Game from "./game";
import BasicBrain from "./brains/basic";

const game = new Game({
    player1Brain: BasicBrain,
    player2Brain: BasicBrain
    renderSettings: {
        fullGame: true
    }
})

game.start();

const stats = game.getStats()

console.log(stats);
