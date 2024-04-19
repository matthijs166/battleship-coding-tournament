export default class Ship {
    type: shipTypes;
    size: number;
    state: ShipState = ShipState.alive;
    emoji: string = "🚢";
    orientation: ShipOrientation = ShipOrientation.horizontal;
    x: number = -1;
    y: number = -1;

    constructor(args: {type: shipTypes, size: number, state?: ShipState, emoji?: string, orientation?: ShipOrientation}){
        this.type = args.type;
        this.size = args.size;
        if(args.state){
            this.state = args.state;
        }
        if(args.emoji){
            this.emoji = args.emoji;
        } else {
            this.emoji = shipEmojis[this.type];
        }
        if(args.orientation){
            this.orientation = args.orientation;
        }
    }

    setPosition(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    setOrientation(orientation: ShipOrientation){
        this.orientation = orientation;
    }

    updateState(state: ShipState){
        this.state = state;
    }
}

export enum ShipState {
    alive,
    sunk
}

export enum ShipOrientation {
    horizontal,
    vertical
}

export enum shipTypes {
    carrier,
    battleship,
    cruiser,
    submarine,
    destroyer
}

const shipEmojis = {
    [shipTypes.carrier]: "🛳️ ",
    [shipTypes.battleship]: "🚢",
    [shipTypes.cruiser]: "🛥️ ",
    [shipTypes.submarine]: "🚤",
    [shipTypes.destroyer]: "⛴️ "
}