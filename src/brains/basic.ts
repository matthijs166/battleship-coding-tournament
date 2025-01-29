import Brain, { type attackTypes, type Turn } from "$game/objects/brain";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class BasicBrain extends Brain {
    name = "Basic Brain";
    memory = {
        maxmines: 5,
    };

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

        // if (!this.brainGameData.myMines) {
        //     logger.error("No mines defined for player");
        //     return;
        // }
        // for (let mine of this.brainGameData.myMines){

        //     let placed = false;
        //     while (!placed) {
        //         const x = Math.floor(Math.random() * 10);
        //         const y = Math.floor(Math.random() * 10);

        //         if (this.memory.maxmines > 0) {
        //             this.memory.maxmines--;
        //             placed = this.placeMine({
        //                 mine,
        //                 x,
        //                 y
        //             });
        //         }

        //         if (placed) {
        //             this.memory.maxmines - 1;
        //             if (this.memory.maxmines <= 0){
        //                 return; // Add return statement to exit the loop
        //             }
        //         }
        //     }
        // }

    }
    turn(): Turn{
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const attackType = Math.random();
        let attack: attackTypes = "default";
        if (attackType < 0.1) {
            attack = "bomb";
        } else if (attackType < 0.2) {
            attack = "cross";
        }

        return {
            x,
            y,
            attack
        }
    }
}
