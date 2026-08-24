import Ship, { ShipOrientation, ShipState } from "$game/objects/ship";
import logger from "$utils/logger";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import Brain from "$game/objects/brain";

// Assuming BasicAkarBrain is the intended default export for the brain:
export default class BasicAkarBrain extends Brain {
    name = "Basic Akar";
    memory = {};
    
    // brainGameData contains myBoard, myShips, enemyBoard
    start() {
        logger.log("BasicAkarBrain start");

        if (!this.brainGameData.myShips) {
            logger.error("No ships defined for player");
            return;
        }

        for (let ship of this.brainGameData.myShips) {
            let placed = false;
            while (!placed) {
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

    getRandomOpenCell(): PlayboardCell {
        const openCells: PlayboardCell[] = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];

        return openCells[Math.floor(Math.random() * openCells.length)];
    }

    turn() {
        const cell = this.getRandomOpenCell();

        if (!cell) {
            return {
                x: 0,
                y: 0
            };
        }

        return {
            x: cell.x,
            y: cell.y
        };
    }
}

// Export Playboard as a named export
export class Playboard {
    xSize: number = 10;
    ySize: number = 10;
    cells: PlayboardCell[][] = [];
    private lockPlacement: boolean = false;

    constructor() {
        this.buildPlayboard();
    }

    buildPlayboard() {
        for (let x = 0; x < this.xSize; x++) {
            let row: PlayboardCell[] = [];
            for (let y = 0; y < this.ySize; y++) {
                row.push(new PlayboardCell(x, y));
            }
            this.cells.push(row);
        }
    }

    printPlayboard() {
        // output the first row 1-10
        let rowNumbers = "  ";
        for (let i = 0; i <= this.xSize - 1; i++) {
            rowNumbers += i + " ";
        }
        console.log(rowNumbers);

        let playboardString = "";
        for (let x = 0; x < this.xSize; x++) {
            // output the row number
            playboardString += x + " ";
            // output the column cell
            for (let y = 0; y < this.ySize; y++) {
                playboardString += this.cells[x][y].emoji;
            }
            playboardString += "\n";
        }
        console.log(playboardString);
    }

    placeShip(args: placeShipArgs): boolean {
        const { ship, x, y, orientation } = args;
        // check board is already locked
        if (this.lockPlacement) {
            logger.error("Ship not placed. Board is locked");
            return false;
        }

        ship.setOrientation(orientation);
        ship.setPosition(x, y);

        // check if the ship can be placed
        if (!this.shipInBounds(ship, x, y)) {
            logger.error("Ship not placed. Ship is out of bounds");
            return false;
        }

        const shipCells = this.getShipCells(ship);

        // Check if the cells are not occupied
        if (shipCells.some(cell => cell.state === CellState.ship)) {
            logger.error("Ship not placed. Ship is overlapping with another ship");
            return false;
        }

        // Update the cells
        for (let cell of shipCells) {
            cell.setShipRef(ship);
        }

        ship.updateState(ShipState.alive);
        return true;
    }

    shipInBounds(ship: Ship, x: number, y: number): boolean {
        if (ship.orientation === ShipOrientation.vertical) {
            if (x + ship.size > this.xSize) {
                return false;
            }
            if (y >= this.ySize) {
                return false;
            }
        } else if (ship.orientation === ShipOrientation.horizontal) {
            if (y + ship.size > this.ySize) {
                return false;
            }
            if (x >= this.xSize) {
                return false;
            }
        }

        return true;
    }

    getShipCells(ship: Ship): PlayboardCell[] {
        const { x, y, size, orientation } = ship;
        let cells: PlayboardCell[] = [];
        for (let i = 0; i < size; i++) {
            if (orientation === ShipOrientation.horizontal) {
                cells.push(this.cells[x][y + i]);
            } else {
                cells.push(this.cells[x + i][y]);
            }
        }
        return cells;
    }

    getCellsByState(state: CellState): PlayboardCell[] {
        let cells: PlayboardCell[] = [];
        for (let row of this.cells) {
            for (let cell of row) {
                if (cell.state === state) {
                    cells.push(cell);
                }
            }
        }
        return cells;
    }
}

export type placeShipArgs = {
    ship: Ship,
    x: number,
    y: number,
    orientation: ShipOrientation
};

export type placeShipCallback = (args: placeShipArgs) => boolean;