import { deepClone } from "$utils/general";
import logger from "$utils/logger";
import type Brain from "./brain";
import type { BrainConstructor, brainGameData } from "./brain";
import Playboard, { type placeShipArgs } from "./playboard";
import Ship, { shipTypes, ShipState } from "./ship";

export default class Player{
    name: string;
    playboard: Playboard;
    ships: Ship[];
    brain: Brain;

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
        ]

        this.brain = new brain(
            {
                myBoard: this.playboard.export(),
                myShips: this.exportShips(),
                enemyBoard: undefined
            },
            (args) => {
                return this.placeShip(args);
            }
        );
    }

    start(){
        this.brain.start();

        if (!this.allShipsPlaced()){
            logger.warning("Not all ships are placed for player " + this.name);
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

        return this.playboard.placeShip(args);
    }

    allShipsSunk(){
        return this.ships.every(ship => ship.state === ShipState.sunk);
    }

    allShipsPlaced(){
        return this.ships.every(ship => ship.state === ShipState.alive);
    }

    exportShips(){
        return deepClone(this.ships);
    }

}