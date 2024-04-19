export class Ship {
    name: shipNames;
    size: number;
    state: ShipState = ShipState.alive;
    emoji: string = "🚢 ";
    orientation: ShipOrientation = ShipOrientation.horizontal;
    x: number = -1;
    y: number = -1;

    constructor(args: {name: shipNames, size: number, state?: ShipState, emoji?: string, orientation?: ShipOrientation}){
        this.name = args.name;
        this.size = args.size;
        if(args.state){
            this.state = args.state;
        }
        if(args.emoji){
            this.emoji = args.emoji;
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

export default class Fleet {
    ships: Ship[] = [];

    constructor() {
        this.ships = [
            new Ship({
                name: shipNames.carrier, 
                size: 5,
                emoji: "🛳️ "
            }),
            new Ship({
                name: shipNames.battleship, 
                size: 4,
                emoji: "🚢"
            }),
            new Ship({
                name: shipNames.cruiser, 
                size: 3,
                emoji: "🛥️ "
            }),
            new Ship({
                name: shipNames.submarine, 
                size: 3,
                emoji: "🚤"
            }),
            new Ship({
                name: shipNames.destroyer, 
                size: 2,
                emoji: "⛴️ "
            })
        ];
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

enum shipNames {
    carrier,
    battleship,
    cruiser,
    submarine,
    destroyer
}