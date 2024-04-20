import Game from "./game";
import BasicBrain from "./brains/basic";

const game = new Game({
    player1Brain: BasicBrain,
    player2Brain: BasicBrain
});