import logger from "$utils/logger";
import BasicBrain from "src/brains/basic";
import Player from "./objects/player";
import type { playboardData } from "./objects/brain";

export type GameArgs = {
    player1Brain: new (playboardData: playboardData) => BasicBrain,
    player2Brain: new (playboardData: playboardData) => BasicBrain
}

export default class Game {
    player1: Player;
    player2: Player;
    playerTurn: 1 | 2 = 1;

    constructor(args: GameArgs){
        this.player1 = new Player(
            "Player 1",
            args.player1Brain
        );
        this.player2 = new Player(
            "Player 2",
            args.player2Brain
        );

        this.render();
        this.start();
    }

    start(){
        this.player1.start();
        this.player2.start();
        this.render();
    }

    updateTick(){
        const currentPlayer = this.playerTurn === 1 ? this.player1 : this.player2;
        const enemyPlayer = this.playerTurn === 1 ? this.player2 : this.player1;

        const attackCoords = currentPlayer.turn();
        if (!attackCoords){
            logger.error("No attack coordinates returned from player " + currentPlayer.name);
            return;
        }

        const {x, y} = attackCoords;
        enemyPlayer.playboard.receiveAttack(x, y);
        this.render();

        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
    }

    render(){
        // clear the screen
        console.clear();

        console.log("----- Welcome to Battleship! -----");
        console.log("");
        console.log("Player 1");
        console.log("");
        this.player1.playboard.printPlayboard();

        console.log("");
        console.log("");
        console.log("Player 2");
        console.log("");
        this.player2.playboard.printPlayboard();

        console.log("");
        console.log("");
        logger.printAll();
    }
}