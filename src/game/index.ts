import brainLoader from "$utils/brainLoader";
import Game from "./gamemodes/default/default";
import Salvo from "./gamemodes/salvo/salvo";
import { checksettings } from "./settings";
import type { Settings } from "./settings";

export async function rungame(args: any) {

let settings: Settings = checksettings(args.gameMode);
let game;

if (settings.gamemode === "salvo") {
    console.log("Running game");
    
    game = new Salvo({
        player1Brain: await brainLoader(args.brain![0]),
        player2Brain: await brainLoader(args.brain![1]),
        settings: {
            fullGameRender: !args.disableRender,
            stepMode: args.stepMode ?? false,
            disableLogRender: args.disableLogRender ?? false,
            simulationSpeed: parseInt(args.simulationSpeed ?? "-1"),
        }
    })

} else {
    console.log("Running game");
    
    game = new Game({
        player1Brain: await brainLoader(args.brain![0]),
        player2Brain: await brainLoader(args.brain![1]),
        settings: {
            fullGameRender: !args.disableRender,
            stepMode: args.stepMode ?? false,
            disableLogRender: args.disableLogRender ?? false,
            simulationSpeed: parseInt(args.simulationSpeed ?? "-1"),
        }
    })
}
    game.start();
    const stats = game.getStats()
    console.log(stats);
}