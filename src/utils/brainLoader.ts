import Brain from "$game/objects/brain";

export default async function brainLoader(file: string){
    let brain = await import("../brains/" + file + ".ts");
    brain = brain.default;
    
    // assert brain is a Brain class
    if (!(brain.prototype instanceof Brain)) {
        throw new Error("Brain: " + file + " is not a Brain class");
    }
    
    return brain;
}