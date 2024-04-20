import Ship, { ShipOrientation, ShipState } from "./ship";
import logger from "$utils/logger";
import PlayboardCell, { CellState } from "./playboardCell";

export default class Playboard{
    xSize: number = 10;
    ySize: number = 10;
    cells: PlayboardCell[][] = [];
    lockPlacement: boolean = false;

    constructor(){
        this.buildPlayboard();
    }

    buildPlayboard(){
        for(let x = 0; x < this.xSize; x++){
            let row: PlayboardCell[] = [];
            for(let y = 0; y < this.ySize; y++){
                row.push(new PlayboardCell(x, y));
            }
            this.cells.push(row);
        }
    }

    printPlayboard(){
        // output the first row 1-10
        let rowNumbers = "  ";
        for(let i = 0; i <= this.xSize-1; i++){
            rowNumbers += i + " ";
        }
        console.log(rowNumbers);

        let playboardString = "";
        for(let x = 0; x < this.xSize; x++){

            // output the row number
            playboardString += x + " ";

            // output the column cell
            for(let y = 0; y < this.ySize; y++){
                playboardString += this.cells[x][y].emoji;
            }
            playboardString += "\n";
        }
        console.log(playboardString);
    }

    placeShip(args: placeShipArgs) : boolean {
        const {ship, x, y, orientation} = args;

        // check board is already locked
        if(this.lockPlacement){
            logger.error("Ship not placed. Board is locked");
            return false;
        }

        ship.setOrientation(orientation);
        ship.setPosition(x, y);
        
        // check if the ship can be placed
        if (!this.shipInBounds(ship, x, y)){
            logger.error("Ship not placed. Ship is out of bounds");
            return false;
        }

        const shipCells = this.getShipCells(ship);

        // Check if the cells are not occupied
        if (shipCells.some(cell => cell.state === CellState.ship)){
            logger.error("Ship not placed. Ship is overlapping with another ship");
            return false;
        }
        
        // Update the cells
        for(let cell of shipCells){
            cell.setShipRef(ship);
        }

        ship.updateState(ShipState.alive);

        return true;
    }

    shipInBounds(ship: Ship, x: number, y: number) : boolean{
        if (ship.orientation === ShipOrientation.vertical){
            if(x + ship.size > this.xSize){
                return false;
            }
            if (y >= this.ySize){
                return false;
            }
        }
        else if (ship.orientation === ShipOrientation.horizontal){
            if(y + ship.size > this.ySize){                
                return false;
            }
            if (x >= this.xSize){
                return false;
            }
        }
        return true;
    }

    getShipCells(ship: Ship){
        let shipCells: PlayboardCell[] = [];
        if(ship.orientation === ShipOrientation.vertical){
            for(let i = 0; i < ship.size; i++){
                shipCells.push(this.cells[ship.x + i][ship.y]);
            }
        }
        else if(ship.orientation === ShipOrientation.horizontal){
            for(let i = 0; i < ship.size; i++){
                shipCells.push(this.cells[ship.x][ship.y + i]);
            }
        }
        return shipCells;
    }

    receiveAttack(x: number, y: number){
        // check if the cell is in bounds
        if(x >= this.xSize || y >= this.ySize){
            logger.error("Cell out of bounds to target anyting");
            return false;
        }

        const cell = this.cells[x][y];

        // check if state of the cell is already hit or missed
        if(cell.state === CellState.hit || cell.state === CellState.miss){
            logger.warning("Cell already targeted before");
            return false;
        }

        if(cell.state === CellState.ship){
            cell.updateState(CellState.hit);
            logger.log("Ship hit!");
            this.validateShipIntegrity(cell.shipRef as Ship);
        }
        else{
            cell.updateState(CellState.miss);
            logger.log("Miss!");
        }

        return cell;
    }

    validateShipIntegrity(ship: Ship){
        const shipCells = this.getShipCells(ship);
        
        // if all cells are hit, ship is sunk update the state
        if(shipCells.every(cell => cell.state === CellState.hit)){
            ship.updateState(ShipState.sunk);
            logger.log("Ship sunk!");
        }
    }

    exportMaskedForOpponent(){
        const boardCopy: Playboard = JSON.parse(JSON.stringify(this));

        // Remove any data about the ships
        boardCopy.cells.forEach(row => {
            row.forEach(cell => {
                if(cell.state === CellState.ship){
                    cell.updateState(CellState.empty);
                }
                cell.shipRef = null;
            });
        });

        return boardCopy;
    }

    export(){
        return JSON.parse(JSON.stringify(this));
    }

    lock(){
        this.lockPlacement = true;
    }
}

export type placeShipArgs = {
    ship: Ship,
    x: number,
    y: number,
    orientation: ShipOrientation
}

export type placeShipCallback = (args: placeShipArgs) => boolean;