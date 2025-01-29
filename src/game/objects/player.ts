import { deepClone } from "$utils/general";
import logger from "$utils/logger";
import type Brain from "./brain";
import type { BrainConstructor, brainGameData } from "./brain";
import Playboard, { type placeShipArgs } from "./playboard";
import Ship, { shipTypes, ShipState } from "./ship";
import Mine, { MineState } from "./mine";

export default class Player{
    name: string;
    playboard: Playboard;
    ships: Ship[];
    brain: Brain;
    mines: Mine[];

    constructor(name: string, brain: BrainConstructor){
        this.name = name;
        this.playboard = new Playboard();
        this.ships = [
            new Ship({
                type: shipTypes.carrier,
                size: 5
            }),
            new Ship({
                type: shipTypes.battleship,
                size: 4
            }),
            new Ship({
                type: shipTypes.cruiser,
                size: 3
            }),
            new Ship({
                type: shipTypes.submarine,
                size: 3
            }),
            new Ship({
                type: shipTypes.destroyer,
                size: 2
            })
        ];
        this.mines = [
            new Mine({
                state: MineState.active
            }),
            new Mine({
                state: MineState.active
            }),
            new Mine({
                state: MineState.active
            }),
            new Mine({
                state: MineState.active
            }),
            new Mine({
                state: MineState.active
            })
        ];

        this.brain = new brain(
            {
                myBoard: this.playboard.export(),
                myShips: this.exportShips(),
                enemyBoard: undefined,
                myMines: this.exportMines()
            },
            (args) => {
                return this.placeShip(args);
            },
            (args) => {
                return this.spawnMine(args.x, args.y);
            }
        );
    }

    start(){
        this.brain.start();

        if (!this.allShipsPlaced()){
            logger.warning("Not all ships are placed for player " + this.name);
        }
        if (!this.allMinesPlaced()){
            logger.warning("Not all mines are placed for player " + this.name);
        }
    }

    updateBrain(brainGameData: brainGameData){
        this.brain.updateBrain(brainGameData);
    }

    turn(){
        return this.brain.turn();
    }

    placeShip(args: placeShipArgs){
        const originalShip = this.ships.find(ship => ship.id === args.ship.id);
        if (!originalShip){
            logger.error("Original Ship object not found anymore");
            return false;
        }
        args.ship = originalShip;
        args.x = args.y;
        args.y = args.x;

        return this.playboard.placeShip(args);
    }

    spawnMine(x: number, y: number) {
        const mine = new Mine({});
        mine.setPosition(x, y);
        this.mines.push(mine);

        const args = { mine, x, y };
        return this.playboard.placeMine(args);
    }

    allShipsSunk(){
        return this.ships.every(ship => ship.state === ShipState.sunk);
    }

    allShipsPlaced(){
        return this.ships.every(ship => ship.state === ShipState.alive);
    }

    allMinesPlaced(){
        return this.mines.every(mine => mine.state === MineState.active);
    }

    exportShips(){
        return deepClone(this.ships);
    }

    exportMines(){
        return deepClone(this.mines);
    }

}