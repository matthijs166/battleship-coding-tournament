import type { playboardData } from "$game/objects/brain";
import type Brain from "$game/objects/brain";
import logger from "$utils/logger";

export default class BasicBrain implements Brain {
    name = "Basic Brain";
    playboardData: playboardData;
    memory = {};

    constructor(playboardData: playboardData){
        this.playboardData = playboardData;
    }

    start(){
        logger.log("BasicBrain start");
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
