import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class BasicOptimized extends Brain {
    name = "Basic Optimized";
    memory = {};
    // brainGameData contains myBoard, myShips, enemyBoard

    start(){
        logger.log("Matthijs start");
        
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


    getCell(x: number, y: number){
        return this.brainGameData.enemyBoard?.cells[x][y] 
    }

    loopAllHitCells(): PlayboardCell | { x: number; y: number; } | null {
        const hitCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.hit) || [];
        for (let cell of hitCells) {
            const x = cell.x;
            const y = cell.y;
            
            if (x + 1 !== 10 && this.getCell(x + 1, y)?.state === CellState.empty) {
                return { x: x + 1, y };
            } else if (x - 1 !== -1 && this.getCell(x - 1, y)?.state === CellState.empty) {
                return { x: x - 1, y };
            } else if (y + 1 !== 10 && this.getCell(x, y + 1)?.state === CellState.empty) {
                return { x, y: y + 1 };
            } else if (y - 1 !== -1 && this.getCell(x, y - 1)?.state === CellState.empty) {
                return { x, y: y - 1 };
            }
            
        }
        return null;
        
    }

    getRandomOpenCell() {
        const hitCells = this.loopAllHitCells();
        if (hitCells !== null) {
            return hitCells;
        }
    
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];
    
        const patternInterval3Cells = openCells.filter(cell => (cell.x + cell.y) % 3 === 0);
    
        let cellsToChooseFrom = patternInterval3Cells.length > 0 ? patternInterval3Cells : openCells.filter(cell => (cell.x + cell.y) % 2 === 0);
    
        cellsToChooseFrom = cellsToChooseFrom.length > 0 ? cellsToChooseFrom : openCells;
    
        return cellsToChooseFrom[Math.floor(Math.random() * cellsToChooseFrom.length)];
    }

    turn(){
        const cell = this.getRandomOpenCell();

        if (!cell){
            return {
                x: 0,
                y: 0
            }
        }  


        return {
            x: cell.x,
            y: cell.y
        }
    }
}