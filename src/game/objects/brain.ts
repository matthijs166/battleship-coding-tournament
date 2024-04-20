import type Playboard from "./playboard";
import type Ship from "./ship";
abstract class Brain {
    abstract name: string;
    brainGameData: brainGameData;
    abstract memory: any;

    constructor(brainGameData: brainGameData){
        this.brainGameData = brainGameData;
    }

    abstract start(): void;

    abstract turn(): {x: number, y: number} | undefined;

    updateBrain(brainGameData: brainGameData): void {
        this.brainGameData = brainGameData;
    }
}

export default Brain;

export type brainGameData = {
    myBoard: Playboard,
    myShips: Ship[] | undefined,
    enemyBoard: Playboard | undefined
}