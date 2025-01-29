import Brain, { type attackTypes, type Turn } from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class BasicOptimized extends Brain {
    name = "Basic Optimized";
    memory = {
        placedmine: [] as { x: number, y: number }[],
        maxmines: 5,
    };
    // brainGameData contains myBoard, myShips, enemyBoard

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

        if (!this.brainGameData.mymines) {
                    logger.error("No mines defined for player");
                    return;
                }
        
                // loop mines and try to place them randomly until all mines are placed
                for (let mine of this.brainGameData.mymines) {
                    let placed = false;
                    while (!placed) {
                        const x = Math.floor(Math.random() * 10);
                        const y = Math.floor(Math.random() * 10);
                        
                        // Check if the new mine placement is too close to existing mines
                        const isTooClose = this.memory.placedmine.some(placedmine => {
                            const distanceX = Math.abs(placedmine.x - x);
                            const distanceY = Math.abs(placedmine.y - y);
                            return distanceX <= 1 && distanceY <= 1;
                        });
                        
                        if (isTooClose) continue;
                        
                        if (this.memory.maxmines > 0) {
                            this.memory.maxmines--;
                            placed = this.placeMine({
                                mine,
                                x,
                                y
                            });
                        }
        
                        if (placed) {
                            this.memory.placedmine.push({ x, y });
                            this.memory.maxmines - 1;
                            if (this.memory.maxmines <= 0){
                                return; // Add return statement to exit the loop
                            }
                        }
                    }
                }

    }

    getRandomOpenCell() : PlayboardCell{
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.unkown) || [];

        // return random cell in cells
        return openCells[Math.floor(Math.random() * openCells.length)];
    }

    turn(): Turn{
        const cell = this.getRandomOpenCell();

        if (!cell){
            return {
                x: 0,
                y: 0,
                attack: "default"
            }
        }

        const attackType = Math.random();
        let attack: attackTypes = "default";
        if (attackType < 0.2) {
            attack = "bomb";
        } else if (attackType < 0.4) {
            attack = "cross";
        }

        return {
            x: cell.x,
            y: cell.y,
            attack
        }
    }
}
