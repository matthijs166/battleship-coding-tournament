import logger from "$utils/logger";
import BasicBrain from "src/brains/basic";
import Player from "./objects/player";
import type { BrainConstructor, brainGameData } from "./objects/brain";

export type GameArgs = {
    player1Brain: BrainConstructor,
    player2Brain: BrainConstructor
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

        // lock the boards
        this.player1.playboard.lock()
        this.player2.playboard.lock();

        this.render();
    }

    updateTick(){
        const currentPlayer = this.playerTurn === 1 ? this.player1 : this.player2;
        const enemyPlayer = this.playerTurn === 1 ? this.player2 : this.player1;

        this.updatePlayerData();

        // Attack the enemy player
        const attackCoords = currentPlayer.turn();
        if (!attackCoords){
            logger.error("No attack coordinates returned from player " + currentPlayer.name);
            return;
        }
        const {x, y} = attackCoords;
        enemyPlayer.playboard.receiveAttack(x, y);

        this.updatePlayerData();

        // finish the turn
        this.render();
        this.playerTurn = this.playerTurn === 1 ? 2 : 1;
    }

    updatePlayerData(){
        const currentPlayer = this.playerTurn === 1 ? this.player1 : this.player2;
        const enemyPlayer = this.playerTurn === 1 ? this.player2 : this.player1;

        currentPlayer.updateBrain({
            myBoard: currentPlayer.playboard.export(),
            enemyBoard: enemyPlayer.playboard.exportMaskedForOpponent(),
            myShips: currentPlayer.exportShips()
        });
        enemyPlayer.updateBrain({
            myBoard: enemyPlayer.playboard.export(),
            enemyBoard: currentPlayer.playboard.exportMaskedForOpponent(),
            myShips: enemyPlayer.exportShips()
        });
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
        logger.printAll(20);
    }
}