import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class MrBackend extends Brain {
    name = "MrBackend";
    memory = {};
    currentStrike = {x: 0, y: 0};

    start(){
        logger.log("MrBackend start");
        this.placeShip({ // 5 
            ship: this.brainGameData.myShips![0],
            y: 2,
            x: 2,
            orientation: ShipOrientation.vertical
        })
        this.placeShip({ // 4
            ship: this.brainGameData.myShips![1],
            x: 2,
            y: 6,
            orientation: ShipOrientation.vertical
        })
        this.placeShip({ // 3
            ship: this.brainGameData.myShips![2],
            x: 0,
            y: 7,
            orientation: ShipOrientation.horizontal
        })
        this.placeShip({ // 3
            ship: this.brainGameData.myShips![3],
            x: 9,
            y: 0,
            orientation: ShipOrientation.horizontal
        })
        this.placeShip({ // 2
            ship: this.brainGameData.myShips![4],
            x: 8,
            y: 5,
            orientation: ShipOrientation.horizontal
        })
    }

    getRandomOpenCell() : PlayboardCell{
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];

        // return random cell in cells
        return openCells[Math.floor(Math.random() * openCells.length)];
    }

    calculateNextBasicHit(){
        let nextRow = this.currentStrike.y + 2 > 9;
        let nextCol = this.currentStrike.x > 9;

        if (nextCol) {
            this.currentStrike = {
                x: 0,
                y: 1
            }
        } else {
            this.currentStrike = {
                x: nextRow ? this.currentStrike.x + 1 : this.currentStrike.x,
                y: nextRow ? Math.ceil((this.currentStrike.y + 2) / 10) - 1 : this.currentStrike.y + 2
            }
        }
        logger.log(this.currentStrike)
    }

    turn(){
        const cell = this.currentStrike;

        this.calculateNextBasicHit();
       

        return cell;
    }
}
