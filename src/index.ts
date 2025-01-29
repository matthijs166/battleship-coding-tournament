import { parseArgs } from "util";
import Benchmark from "./benchmarking";
import { rungame } from "./game";
import BenchmarkOld from "../src(old)/benchmarking";
import rungameold  from "../src(old)/game";
import { runBenchmarkOld, runGameOld } from "src(old)";

export let args = parseArgs({
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
        gamemode: {
            type: 'string',
            default: 'default',
        }
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
if (args.gamemode === "old"){
    // Run benchmarking or game
    if (args.benchmark) {
        runBenchmarkOldi()
    }
    else if (args.run) {
        runGameOldi()
    }
    async function runBenchmarkOldi() {
        runBenchmarkOld(args)
    }

    async function runGameOldi() {
        runGameOld(args)
    }
}else{
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
        rungame(args)
    }
}