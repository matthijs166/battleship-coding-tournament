import type Playboard from "./playboard";
abstract class Brain {
    abstract name: string;
    playboardData: playboardData;
    abstract memory: any;

    constructor(playboardData: playboardData){
        this.playboardData = playboardData;
    }

    abstract start(): void;

    abstract turn(): {x: number, y: number} | undefined;

    updateBrain(playboardData: playboardData): void {
        this.playboardData = playboardData;
    }
}

export default Brain;

export type playboardData = {
    my: Playboard,
    enemy: Playboard | undefined
}