import Brain from "$game/objects/brain";
import type Playboard from "$game/objects/playboard";
import logger from "$utils/logger";

export default class BasicBrain extends Brain {
    name = "Basic Brain";
    memory = {};

    start(){
        logger.log("BasicBrain start");

        const firstShip = this.brainGameData.myShips![0];

        this.placeShip({
            ship: firstShip,
            x: 0,
            y: 0,
            orientation: 0
        });

    }

    turn(){
        logger.log("BasicBrain turn");

        // Hit a random cell on the enemy playboard
        return {
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10)
        }
    }
}
