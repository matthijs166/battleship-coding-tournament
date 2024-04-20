import Brain from "$game/objects/brain";
import logger from "$utils/logger";

export default class BasicBrain extends Brain {
    name = "Basic Brain";
    memory = {};

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
