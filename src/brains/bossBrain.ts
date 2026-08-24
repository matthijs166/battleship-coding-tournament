import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class MatthijsBrain extends Brain {
    name = "Basic Brain";
    memory = {};

    placementStrategy = [  
        ['1', ' ', '2', ' ', '1', ' ', '2', ' ', '1', ' '],
        [' ', '2', ' ', '1', ' ', '2', ' ', '1', ' ', '3'],
        ['2', ' ', '1', ' ', '2', ' ', '1', ' ', '2', ' '],
        [' ', '1', ' ', '2', ' ', '1', ' ', '2', ' ', '1'],
        ['1', ' ', '2', ' ', '1', ' ', '2', ' ', '1', ' '],
        [' ', '2', ' ', '1', ' ', '2', ' ', '1', ' ', '2'],
        ['2', ' ', '1', ' ', '2', ' ', '1', ' ', '2', ' '],
        [' ', '1', ' ', '2', ' ', '1', ' ', '2', ' ', '1'],
        ['1', ' ', ' 2', ' ', '1', ' ', '2 ', ' ', '1', ' '],
        ['2', '3', ' ', '1', ' ', '2', ' ', '1', ' ', '2']
    ]

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

    turn(){
        let searchAndDestroyTarget = this.searchAndDestroy();

        if (searchAndDestroyTarget) {
            return searchAndDestroyTarget;
        }


        const hitBasedOnPlacementStrategy_round1 = this.getCellFromPlacementStrategy(this.placementStrategy);
        if (hitBasedOnPlacementStrategy_round1) {
            return {
                x: hitBasedOnPlacementStrategy_round1.y,
                y: hitBasedOnPlacementStrategy_round1.x
            }
        }

        const hitBasedOnPlacementStrategy_round2 = this.getCellFromPlacementStrategy(this.placementStrategy, '2');
        if (hitBasedOnPlacementStrategy_round2) {
            return {
                x: hitBasedOnPlacementStrategy_round2.y,
                y: hitBasedOnPlacementStrategy_round2.x
            }
        }

        const hitBasedOnPlacementStrategy_round3 = this.getCellFromPlacementStrategy(this.placementStrategy, '3');
        if (hitBasedOnPlacementStrategy_round3) {
            return {
                x: hitBasedOnPlacementStrategy_round3.y,
                y: hitBasedOnPlacementStrategy_round3.x
            }
        }

        const cell = this.getRandomOpenCell();

        return cell
    }

    countCellsHit(){
        this.brainGameData.enemyBoard?.getCellsByState(CellState.hit).length
    }

    searchAndDestroy(): {x:number, y:number} | false{
        const allCellsHit = this.brainGameData.enemyBoard?.getCellsByState(CellState.hit);
        if (!allCellsHit) {
            return false
        }

        let place: {x:number, y:number} | false = false;

        allCellsHit.forEach(cell => {
            // get cells around cell
            const cellsAround = this.getCellsAround(cell);

            cellsAround.forEach(cell => {
                if (cell) {
                    place = {x: cell.x, y: cell.y}
                    return false
                }
            })
            
            if (place) {
                return false
            }
        })

        if(place){
            return place;
        }
        
        return false
    }

    getCellsAround(targetCell: PlayboardCell) {
        let cells: PlayboardCell[] = [];

        // left
        if (targetCell.x > 1) {
            let cell = this.brainGameData.enemyBoard?.cells?.[targetCell.x]?.[targetCell.y - 1]
            if (cell) {
                if (cell.state === CellState.empty) {
                    cells.push(cell);
                }
            }
        }

        // right
        if (targetCell.x < 10) {
            let cell = this.brainGameData.enemyBoard?.cells?.[targetCell.x]?.[targetCell.y + 1]
            if (cell) {
                if (cell.state === CellState.empty) {
                    cells.push(cell);
                }
            }
        }

        // top
        if (targetCell.y > 10) {
            let cell = this.brainGameData.enemyBoard?.cells?.[targetCell.x - 1]?.[targetCell.y]
            if (cell) {
                if (cell.state === CellState.empty) {
                    cells.push(cell);
                }
            }
        }

        // bottom
        if (targetCell.y < 10) {
            let cell = this.brainGameData.enemyBoard?.cells?.[targetCell.x + 1]?.[targetCell.y]
            if (cell) {
                if (cell.state === CellState.empty) {
                    cells.push(cell);
                }
            }
        }

        return cells;
    }

    getCellFromPlacementStrategy(placementStrategy:string[][], search='1') : {x:number, y:number} | false {
        const allEmptyCells = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty);
        if (!allEmptyCells) {
            return false
        }

        let place: {x:number, y:number} | false = false;

        // loop placementStrategy if '1' and empty cell, return x and y
        placementStrategy.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === search && allEmptyCells.find(cell => cell.y === x && cell.x === y)) {
                    place = {x, y}
                    return false
                }
            })
            if (place) {
                return false
            }
        })

        if(place){
            return place;
        }

        return false
    }

    getRandomOpenCell() : PlayboardCell{
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];

        // return random cell in cells
        return openCells[Math.floor(Math.random() * openCells.length)];
    }
}
