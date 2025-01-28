import Ship, { ShipOrientation, ShipState } from "./ship";
import logger from "$utils/logger";
import PlayboardCell, { CellState } from "./playboardCell";
import { deepClone } from "$utils/general";
import Mine, { MineState } from "./mine";

export default class Playboard {
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
            cell.updateState(CellState.ship); // Ensure the state is set to ship
        }

        ship.updateState(ShipState.alive);

        return true;
    }

    placeMine(args: placeMineArgs): boolean {
        const { mine, x, y } = args;

        // check if the cell is in bounds
        if (y >= this.ySize || x >= this.xSize) {
            logger.error("Mine not placed. Mine is out of bounds");
            return false;
        }

        const cell = this.cells[y][x];

        // Check if the cell is not occupied
        if (cell.state === CellState.ship || cell.state === CellState.mine) {
            logger.error("Mine not placed. Cell is occupied by a ship or another mine");
            return false;
        }

        // Update the cell
        cell.setMineRef(mine);
        cell.updateState(CellState.mine);

        mine.updateState(MineState.active);

        return true;
    }

    shipInBounds(ship: Ship, x: number, y: number): boolean {
        if (ship.orientation === ShipOrientation.horizontal) {
            if (x + ship.size > this.xSize) {
                return false;
            }
            if (y >= this.ySize) {
                return false;
            }
        }
        else if (ship.orientation === ShipOrientation.vertical) {
            if (y + ship.size > this.ySize) {
                return false;
            }
            if (x >= this.xSize) {
                return false;
            }
        }
        return true;
    }

    getShipCells(ship: Ship) {
        let shipCells: PlayboardCell[] = [];
        if (ship.orientation === ShipOrientation.horizontal) {
            for (let i = 0; i < ship.size; i++) {
                shipCells.push(this.cells[ship.x + i][ship.y]);
            }
        }
        else if (ship.orientation === ShipOrientation.vertical) {
            for (let i = 0; i < ship.size; i++) {
                shipCells.push(this.cells[ship.x][ship.y + i]);
            }
        }
        return shipCells;
    }

    useBomb(x: number, y: number) {
        // check if the cell is in bounds
        if (x >= this.xSize || y >= this.ySize) {
            logger.error("Cell out of bounds to target anyting");
            return false;
        }

        const cellsToCheck = [
            { x, y }, // center
            { x: x - 1, y }, // left
            { x: x + 1, y }, // right
            { x, y: y - 1 }, // top
            { x, y: y + 1 },  // bottom
            { x: x - 1, y: y - 1 }, // top left
            { x: x + 1, y: y - 1 },  // top right
            { x: x + 1, y: y + 1 }, // bottom right
            { x: x - 1, y: y + 1 }, // bottom left
        ];

        //loop through the recieveattack function
        cellsToCheck.forEach(({ x, y }) => {
            if (x >= 0 && x < this.xSize && y >= 0 && y < this.ySize) {
                this.receiveAttack(x, y);
            }
        });

        return true;
    }

    useCross(x: number, y: number) {
        // check if the cell is in bounds
        if (x >= this.xSize || y >= this.ySize) {
            logger.error("Cell out of bounds to target anything");
            return false;
        }

        const cellsToCheck = [
            { x, y }, // center
            { x: x - 1, y }, // left
            { x: x + 1, y }, // right
            { x, y: y - 1 }, // top
            { x, y: y + 1 }  // bottom
        ];

        cellsToCheck.forEach(({ x, y }) => {
            if (x >= 0 && x < this.xSize && y >= 0 && y < this.ySize) {
                this.receiveAttack(x, y);
            }
        });

        return true;
    }

    receiveAttack(x: number, y: number) {
        // check if the cell is in bounds
        if (x >= this.xSize || y >= this.ySize) {
            logger.error("Cell out of bounds to target anything");
            return false;
        }

        const cell = this.cells[x][y];

        if (cell.state === CellState.unkown) {
            cell.updateState(CellState.empty);
        }

        // check if state of the cell is already hit or missed
        if (cell.state === CellState.hit || cell.state === CellState.miss) {
            logger.warning("Cell already targeted before");
            return false;
        }

        if (cell.state === CellState.ship) {
            cell.updateState(CellState.hit);
            logger.log("Ship hit!");
            this.validateShipIntegrity(cell.shipRef as Ship);
        }
        else if (cell.state === CellState.mine) {
            cell.updateState(CellState.hit);
            logger.log("Mine hit!");
            // Handle mine explosion logic if needed
        }
        else {
            cell.updateState(CellState.miss);
            logger.log("Miss!");
        }

        return cell;
    }

    validateShipIntegrity(ship: Ship) {
        const shipCells = this.getShipCells(ship);

        // if all cells are hit, ship is sunk update the state
        if (shipCells.every(cell => cell.state === CellState.hit)) {
            ship.updateState(ShipState.sunk);
            logger.log("Ship sunk!");
        }
    }

    exportMaskedForOpponent() {
        const boardCopy: Playboard = deepClone(this);

        // Remove any data about the ships
        boardCopy.cells.forEach(row => {
            row.forEach(cell => {
                if (cell.state === CellState.ship) {
                    cell.updateState(CellState.unkown);
                }
                cell.shipRef = null;
            });
        });

        return boardCopy;
    }

    export() {
        return deepClone(this);
    }

    lock() {
        this.lockPlacement = true;
    }

    getAllCells() {
        return this.cells.flat();
    }

    getCellsByState(cellState: CellState | undefined) {
        return this.getAllCells()
            .filter(cell => cell.state === cellState || cellState === undefined);
    }

    useRadar(x: number, y: number) {
        // check if the cell is in bounds
        if (y >= this.ySize || x >= this.xSize) {
            logger.error("Cell out of bounds to scan anything");
            return false;
        }

        const cellsToCheck = [
            { x, y }, // center
            { x: x - 1, y }, // left
            { x: x + 1, y }, // right
            { x, y: y - 1 }, // top
            { x, y: y + 1 },  // bottom
            { x: x - 1, y: y - 1 }, // top left
            { x: x + 1, y: y - 1 },  // top right
            { x: x + 1, y: y + 1 }, // bottom right
            { x: x - 1, y: y + 1 }, // bottom left
        ];

        const radarResults = cellsToCheck.map(({ x, y }) => {
            if (x >= 0 && x < this.xSize && y >= 0 && y < this.ySize) {
                const cell = this.cells[x][y];
                if (cell.state === CellState.unkown) {
                    cell.updateState(CellState.empty);
                }
                return { x, y, state: cell.state };
            }
            return null;
        }).filter(result => result !== null);

        return radarResults;
    }
}

export type placeShipArgs = {
    ship: Ship,
    x: number,
    y: number,
    orientation: ShipOrientation
}

export type placeMineArgs = {
    mine: Mine,
    x: number,
    y: number
}

export type placeShipCallback = (args: placeShipArgs) => boolean;
export type placeMineCallback = (args: placeMineArgs) => boolean;