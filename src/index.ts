import { parseArgs } from "util";
import Benchmark from "./benchmarking";
import Game from "./game";
import brainLoader from "$utils/brainLoader";


let args = parseArgs({
    args: Bun.argv,
    tokens: true,
    options: {
        benchmark: {
            type: 'boolean',
        },
        run: {
            type: 'boolean',
        },
        brain: {
            type: 'string',
            multiple: true,
        },
        threads: {
            type: 'string',
            default: '4',
        },
        iterations: {
            type: 'string',
            default: '100',
        },
        simulationSpeed: {
            type: 'string',
            default: '-1',
        },
    },
    strict: true,
    allowPositionals: true,
}).values

// Parse brains with , | or ; separators
args.brain = args.brain?.flatMap((brain: string) => brain.split(/[,|;]/))

if (!args.brain?.length || args.brain?.length === 0) {
    console.error("You need to provide at least one brain")
    process.exit(1)
}

if (args.brain?.length === 1) {
    console.log("We duplicate the brain for the second player")
    args.brain.push(args.brain[0])
}

// Run benchmarking or game
if (args.benchmark) {
    runBenchmark()
}
else if (args.run) {
    runGame()
}

async function runBenchmark() {
    new Benchmark({
        iterations: 1000,
        threads: 10,
        brainFileNames: args.brain!
    })
}

async function runGame() {
    console.log("Running game");
    
    const game = new Game({
        player1Brain: await brainLoader(args.brain![0]),
        player2Brain: await brainLoader(args.brain![1]),
        renderSettings: {
            fullGame: true
        },
        simulationSpeed: parseInt(args.simulationSpeed ?? "-1")
    })
    game.start();
    const stats = game.getStats()
    console.log(stats);
}