import type Brain from "$game/objects/brain";
import { ChartColors } from "./chart";
import { renderLayout } from "./layout";
import { Worker } from "worker_threads";
import type { WorkerMessage } from "./worker";
import logger from "$utils/logger";
import type { GameStats } from "$game/index";

type BenchmarkOptions = {
    iterations: number;
    threads: number;
    brainFileNames: String[];
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
    brain1: String;
    brain2: String;
    id: number;
    status: BenchmarkTournamentStatus;
    stats?: GameStats;
}

export default class Benchmark {

    threads: BenchmarkThread[] = [];
    options: BenchmarkOptions;
    tournament: BenchmarkTournament[] = [];

    constructor(options: BenchmarkOptions) {
        this.options = options;

        this.generateTournament();
        this.bootThreads();        

        setInterval(() => {
            this.render();
            // TODO: BREAK LOOP IF ALL THREADS ARE DONE
        }, 100);
    }

    generateTournament() {
        // generate all permutations
        let permutations = [];
        for (let i = 0; i < this.options.brainFileNames.length; i++) {
            for (let j = i + 1; j < this.options.brainFileNames.length; j++) {
                permutations.push([this.options.brainFileNames[i], this.options.brainFileNames[j]]);
            }
        }

        // Generate tournament rounds from permutations
        let i = 0;
        let tournamentId = 0;
        while (this.tournament.length < this.options.iterations) {
            const tournamentRound: BenchmarkTournament = {
                brain1: permutations[i][0],
                brain2: permutations[i][1],
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
            brainFile1: tournament.brain1,
            brainFile2: tournament.brain2,
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
                brainStats: [
                    {
                        name: "Brain 1",
                        winRate: 0,
                        loseRate: 0,
                        takenHits: 0,
                        givenHits: 0,
                        color: ChartColors.red
                    },
                    {
                        name: "Brain 2",
                        winRate: 0,
                        loseRate: 0,
                        takenHits: 0,
                        givenHits: 0,
                        color: ChartColors.blue
                    }
                ],
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
    }

}

new Benchmark({
    iterations: 300,
    threads: 10,
    brainFileNames: [
        // "basicOptimized",
        "basic",
        "basic",
    ]
})