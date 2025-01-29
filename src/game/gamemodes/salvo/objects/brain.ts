import type Mine from "./mine";
import type { placeMineArgs, placeMineCallback, placeShipArgs, placeShipCallback } from "./playboard";
import type Playboard from "./playboard";
import type Ship from "./ship";
abstract class Brain {
    abstract name: string;
    brainGameData: brainGameData;
    abstract memory: any;
    placeShipCallback: placeShipCallback;
    placeMineCallback: placeMineCallback;

    constructor(brainGameData: brainGameData, placeShipCallback: placeShipCallback, placeMineCallback: placeMineCallback) {
        this.brainGameData = brainGameData;
        this.placeShipCallback = placeShipCallback;
        this.placeMineCallback = placeMineCallback;
    }

    abstract start(): void;

    abstract turn(): Turn | undefined;

    updateBrain(brainGameData: brainGameData): void {
        this.brainGameData = brainGameData;
    }

    placeShip(args: placeShipArgs){
        return this.placeShipCallback(args);
    }
    placeMine(args: placeMineArgs){
        return this.placeMineCallback(args);
    }
}

export default Brain;

export type BrainConstructor = new (brainGameData: brainGameData, placeShipCallback: placeShipCallback, placeMineCallback: placeMineCallback) => Brain;

export type brainGameData = {
    myBoard: Playboard,
    myShips: Ship[] | undefined,
    enemyBoard: Playboard | undefined
    myMines: Mine[] | undefined
}
export type attackTypes = "default" | "bomb" | "cross" | "radar";

export type Turn = {
    x: number,
    y: number,
    attack: attackTypes
}