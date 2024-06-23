import { expect } from "bun:test";
import Game, { type GameStats } from "../game";
import Brain from "$game/objects/brain";

let threadId: number;
let gameId: number;
let brainCache: Map<String, Brain> = new Map();

export type WorkerMessagePing = {
    type: "ping";
    threadId: number;
}

export type WorkerMessagePong = {
    type: "pong";
    threadId: number;
}

export type WorkerMessageStartGame = {
    type: "startGame";
    threadId: number;
    brainFile1: String;
    brainFile2: String;
    gameId: number;
}

export type WorkerMessageGameStats = {
    type: "gameStats";
    threadId: number;
    gameId: number;
    stats: GameStats;
}

export type WorkerMessage = 
    WorkerMessagePing | 
    WorkerMessageStartGame | 
    WorkerMessageGameStats |
    WorkerMessagePong;

addEventListener("message", async (event) => {
    const message = event.data as WorkerMessage;
    expect(message.type).toBeDefined();

    threadId = message.threadId;

    // Handle Ping
    if (message.type === "ping") {
        const pongMessage: WorkerMessagePong = {
            type: "pong",
            threadId: message.threadId
        }
        postMessage(pongMessage);
    }

    // Handle Start Game
    if (message.type === "startGame") {
        gameId = message.gameId;
    
        const game = new Game({
            player1Brain: await loadBrainFile(message.brainFile1),
            player2Brain: await loadBrainFile(message.brainFile2),
            renderSettings: {
                fullGame: false
            }
        })

        game.start();

        const gameStatsMessage: WorkerMessageGameStats = {
            type: "gameStats",
            threadId: message.threadId,
            gameId: message.gameId,
            stats: game.getStats()
        }

        postMessage(gameStatsMessage);

    }
});

async function loadBrainFile(file: String){
    // check brain cache
    if (brainCache.has(file)){
        return brainCache.get(file);
    }

    let brain = await import("../brains/" + file + ".ts");
    brain = brain.default;
    
    // assert brain is a Brain class
    if (!(brain.prototype instanceof Brain)) {
        throw new Error("Brain: " + file + " is not a Brain class");
    }

    // update brain cache
    brainCache.set(file, brain);
    
    return brain;
}