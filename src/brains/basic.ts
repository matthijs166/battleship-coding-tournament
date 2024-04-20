import Brain from "$game/objects/brain";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class BasicBrain extends Brain {
    name = "Basic Brain";
    memory = {};

    start(){
        logger.log("BasicBrain start");
        
        // if this.brainGameData.myShips not defined, return
        if (!this.brainGameData.myShips){
            logger.error("No ships defined for player");
            return;
        }

        // loop ships and try to place them randomly until all ships are placed
        for (let ship of this.brainGameData.myShips){
            let placed = false;
            while(!placed){
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const orientation = Math.random() > 0.5 ? ShipOrientation.horizontal : ShipOrientation.vertical;

                placed = this.placeShip({
                    ship,
                    x,
                    y,
                    orientation
                });
            }
        }

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
