import type { placeShipArgs, placeShipCallback } from "./playboard";
import type Playboard from "./playboard";
import type Ship from "./ship";
abstract class Brain {
    abstract name: string;
    brainGameData: brainGameData;
    abstract memory: any;
    placeShipCallback: placeShipCallback;

    constructor(brainGameData: brainGameData, placeShipCallback: placeShipCallback){
        this.brainGameData = brainGameData;
        this.placeShipCallback = placeShipCallback;
    }

    abstract start(): void;

    abstract turn(): {x: number, y: number} | undefined;

    updateBrain(brainGameData: brainGameData): void {
        this.brainGameData = brainGameData;
    }

    placeShip(args: placeShipArgs){
        this.placeShipCallback(args);
    }
}

export default Brain;

export type BrainConstructor = new (brainGameData: brainGameData, placeShipCallback: placeShipCallback) => Brain;

export type brainGameData = {
    myBoard: Playboard,
    myShips: Ship[] | undefined,
    enemyBoard: Playboard | undefined
}