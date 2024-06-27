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
        disableRender: {
            type: 'boolean',
        },
        stepMode: {
            type: 'boolean',
        },
        disableLogRender: {
            type: 'boolean'
        },
        chartWidth: {
            type: 'string',
        },
        threads: {
            type: 'string',
            default: '4',
        },
        iterations: {
            type: 'string',
            default: '1000',
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
        iterations: parseInt(args.iterations ?? "1000"),
        threads: parseInt(args.threads ?? "4"),
        brainFileNames: args.brain!,
        chartWidth: parseInt(args.chartWidth ?? "")
    })
}


async function runGame() {
    console.log("Running game");
    
    const game = new Game({
        player1Brain: await brainLoader(args.brain![0]),
        player2Brain: await brainLoader(args.brain![1]),
        settings: {
            fullGameRender: !args.disableRender,
            stepMode: args.stepMode ?? false,
            disableLogRender: args.disableLogRender ?? false,
            simulationSpeed: parseInt(args.simulationSpeed ?? "-1")
        },
    })
    game.start();
    const stats = game.getStats()
    console.log(stats);
}