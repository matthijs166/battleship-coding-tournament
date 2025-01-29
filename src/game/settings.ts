export type Settings = {
    gamemode: string;
}
export type Args = "default" | "salvo" | "old";





export function checksettings(args: Args) {
    let settings: Settings = {
        gamemode: args,
    }
    return settings;
}