import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class BasicOptimized extends Brain {
    name = "Basic Optimized";
    memory = {};
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

    }

    getRandomOpenCell() : PlayboardCell{
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];

        // return random cell in cells
        return openCells[Math.floor(Math.random() * openCells.length)];
    }

    turn(){
        const cell = this.getRandomOpenCell();
        return {
            x: cell.x,
            y: cell.y
        }
    }
}
