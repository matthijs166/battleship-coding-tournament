import type Playboard from "./playboard";

interface Brain {
    name: string;
    playboardData: playboardData;
    memory: any;

    // Method before we start the game
    // Place your ships here
    start(): void;
    
    // Method triggered when it's your turn
    turn(): {x: number, y: number} | undefined;
}

export interface BrainConstructor {
    new(myPlayboard: Playboard): Brain;
}

declare var Brain: BrainConstructor;

export default Brain;

export type playboardData = {
    my: Playboard,
    enemy: Playboard | undefined
}