import type Brain from "$game/objects/brain";
import { ChartColors } from "./chart";
import { renderLayout, type BrainStat } from "./layout";
import { Worker } from "worker_threads";
import type { WorkerMessage } from "./worker";
import logger from "$utils/logger";
import type { GameStats } from "$game/index";

type BenchmarkOptions = {
    iterations: number;
    threads: number;
    brainFileNames: string[];
}

enum BenchmarkThreadStatus {
    booting = "booting",
    idle = "idle",
    busy = "busy"
}

type BenchmarkThread = {
    worker: Worker;
    status: BenchmarkThreadStatus;
    id: number;
}

enum BenchmarkTournamentStatus {
    open = "open",
    busy = "busy",
    done = "done"
}

type BenchmarkTournament = {
    brain1: {
        id: number;
        fileName: String;
    };
    brain2: {
        id: number;
        fileName: String;
    };
    id: number;
    status: BenchmarkTournamentStatus;
    stats?: GameStats;
}

export default class Benchmark {

    threads: BenchmarkThread[] = [];
    options: BenchmarkOptions;
    tournament: BenchmarkTournament[] = [];
    renderLoop: Timer;

    constructor(options: BenchmarkOptions) {
        this.options = options;

        this.generateTournament();
        this.bootThreads();        

        this.renderLoop = setInterval(() => {
            this.render();
            if (this.allThreadsIdle()) {
                clearInterval(this.renderLoop);
                this.clearWorker();
            }
        }, 10);
    }

    allThreadsIdle() {
        return this.threads.every((thread) => thread.status === BenchmarkThreadStatus.idle);
    }

    clearWorker() {
        this.threads.forEach((thread) => {
            thread.worker.terminate();
        })
    }

    generateTournament() {
        // generate ids for each brain
        const brainFileNames = this.options.brainFileNames.map((brain, index) => {
            return brain + "[_]" + index;
        })

        // generate all permutations
        let permutations = [];
        for (let i = 0; i < brainFileNames.length; i++) {
            for (let j = i + 1; j < brainFileNames.length; j++) {
                permutations.push([brainFileNames[i], brainFileNames[j]]);
            }
        }

        // Generate tournament rounds from permutations
        let i = 0;
        let tournamentId = 0;
        while (this.tournament.length < this.options.iterations) {
            const tournamentRound: BenchmarkTournament = {
                brain1: {
                    fileName: permutations[i][0].split("[_]")[0],
                    id: parseInt(permutations[i][0].split("[_]")[1])
                },
                brain2: {
                    fileName: permutations[i][1].split("[_]")[0],
                    id: parseInt(permutations[i][1].split("[_]")[1])
                },
                status: BenchmarkTournamentStatus.open,
                id: tournamentId
            }
            this.tournament.push(tournamentRound);
            i++;
            tournamentId++;
            // Loop back to the start of the permutations
            if (i >= permutations.length) {
                i = 0;
            }
        }

        logger.log("Tournaments generated");
    }

    bootThreads() {
        for (let i = 0; i < this.options.threads; i++) {
            const worker = new Worker(__dirname + "/worker.ts")
            // Set Handelers
            worker.on("message", (event) => this.handelWorkerMessage(event));
            // Store Thread
            this.threads[i] = {
                worker,
                status: BenchmarkThreadStatus.booting,
                id: i
            }
            // Send ping to assert worker is ready
            this.sendWorkerMessage({ 
                type: "ping",
                threadId: i
            });

        }
    }

    sendWorkerMessage(message: WorkerMessage) {
        this.threads[message.threadId].worker.postMessage(message);
    }

    handelWorkerMessage(event: WorkerMessage) {              
        if (event.type === "pong") {
            this.threads[event.threadId].status = BenchmarkThreadStatus.idle;
            logger.log(`Thread ${event.threadId} is ready`);
            this.giveThreadWork(event.threadId);
        }

        else if (event.type === "gameStats") {
            const tournament = this.tournament[event.gameId];
            tournament.stats = event.stats;
            tournament.status = BenchmarkTournamentStatus.done;

            logger.log(`Tournament ${tournament.id} is done`);

            this.giveThreadWork(event.threadId);
        }
    }

    giveThreadWork(threadId: number) {
        const thread = this.threads[threadId];
        const tournament = this.findOpenTournament();

        if (!tournament) {
            thread.status = BenchmarkThreadStatus.idle;
            logger.log(`Thread ${threadId} is idle, no work found`);
            return;
        }

        this.tournament[tournament.id].status = BenchmarkTournamentStatus.busy;
        thread.status = BenchmarkThreadStatus.busy;
        
        this.sendWorkerMessage({
            type: "startGame",
            threadId: threadId,
            brainFile1: tournament.brain1.fileName,
            brainFile2: tournament.brain2.fileName,
            gameId: tournament.id
        });

        logger.log(`Thread ${threadId} is busy with tournament ${tournament.id}`);
    }

    findOpenTournament() : BenchmarkTournament | undefined {
        return this.tournament.find((tournament) => tournament.status === BenchmarkTournamentStatus.open);
    }

    render() {
        console.clear();

        renderLayout({
            brainStats: this.options.brainFileNames.map((brain, index) => this.generatePlayerStats(index)),
            progress: {
                current: this.tournament.filter((tournament) => tournament.status === BenchmarkTournamentStatus.done).length,
                total: this.options.iterations
            },
            CPUStats: [
                {
                    core: 1,
                    load: 0
                }
            ]
        })

        logger.printAll(5);
    }

    generatePlayerStats(id: number): BrainStat{
        
        let stats: BrainStat = {
            name: this.options.brainFileNames[id],
            winRate: 0,
            loseRate: 0,
            takenHits: 0,
            givenHits: 0,
            crashes: 0,
            color: Object.values(ChartColors)[id]
        }

        // loop through all tournaments
        this.tournament.forEach((tournament) => {

            if (!tournament.stats) return

            // count wins 
            if (tournament.brain1.id === id && tournament.stats.winner === 1) {
                stats.winRate++;
            } else if (tournament.brain2.id === id && tournament.stats.winner === 2) {
                stats.winRate++;
            }

            // count loses
            if (tournament.brain1.id === id && tournament.stats.winner === 2) {
                stats.loseRate++;
            } else if (tournament.brain2.id === id && tournament.stats.winner === 1) {
                stats.loseRate++;
            }

            // count hits taken
            if (tournament.brain1.id === id) {
                stats.takenHits += tournament.stats.player1.hitsTaken
            } else if (tournament.brain2.id === id) {
                stats.takenHits += tournament.stats?.player2.hitsTaken
            }

            // count hits given
            if (tournament.brain1.id === id) {
                stats.givenHits += tournament.stats.player1.hitsGiven
            } else if (tournament.brain2.id === id) {
                stats.givenHits += tournament.stats?.player2.hitsGiven
            }

            // count crashes
            if (tournament.brain1.id === id && tournament.stats.playerCrashedGame === 1) {
                stats.crashes++;
            } else if (tournament.brain2.id === id && tournament.stats.playerCrashedGame === 2) {
                stats.crashes++;
            }


        })

        return stats;
    }

}