import logger from "$utils/logger";
import type Brain from "./brain";
import type { brainGameData } from "./brain";
import Playboard from "./playboard";
import Ship, { shipTypes, ShipState } from "./ship";

export default class Player{
    name: string;
    playboard: Playboard;
    ships: Ship[];
    brain: Brain;

    constructor(name: string, brain: new (brainGameData: brainGameData) => Brain){
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

        this.brain = new brain({
            my: this.playboard,
            enemy: undefined
        });
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

    allShipsSunk(){
        return this.ships.every(ship => ship.state === ShipState.sunk);
    }

    allShipsPlaced(){
        return this.ships.every(ship => ship.state === ShipState.alive);
    }

}