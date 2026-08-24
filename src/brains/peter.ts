import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";
export default class BasicBrain extends Brain {
    name = "Basic Brain";
    memory = {};
    start() {
        logger.log("BasicBrain start");
        if (!this.brainGameData.myShips) {
            logger.error("No ships defined for player");
            return;
        }
        let placedVerticallyAtBottom = true;
        for (let ship of this.brainGameData.myShips) {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * 10);
                let y, orientation;
                if (!placedVerticallyAtBottom && Math.random() < 0.5) {
                    y = 9;
                    orientation = ShipOrientation.vertical;
                    placedVerticallyAtBottom = true;
                } else {
                    y = Math.floor(Math.random() * 1);
                    orientation = ShipOrientation.horizontal;
                }
                placed = this.placeShip({
                    ship,
                    x,
                    y,
                    orientation
                });
            }
        }
    }
    turn() {
        const cell = this.getRandomOpenCell();
        return {
            x: cell.x,
            y: cell.y
        };
    }
    getRandomOpenCell(): PlayboardCell {
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];
        // Return a random cell in cells
        return openCells[Math.floor(Math.random() * openCells.length)];
    }
}