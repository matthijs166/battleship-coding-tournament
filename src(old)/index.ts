import Benchmark from "./benchmarking";
import Game from "./game";
import brainLoader from "$utilsold/brainLoader";


export async function runBenchmarkOld(args: any) {
    new Benchmark({
        iterations: parseInt(args.iterations ?? "1000"),
        threads: parseInt(args.threads ?? "4"),
        brainFileNames: args.brain!,
        chartWidth: parseInt(args.chartWidth ?? "")
    })
}


export async function runGameOld(args: any) {
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