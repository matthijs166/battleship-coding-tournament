export default class Mine {
    state: MineState = MineState.idle;
    emoji: string = "💣";
    x: number = 0;
    y: number = 0;
    id: number = Math.floor(Math.random() * 1000);

    constructor(args: {state?: MineState, emoji?: string}) {
        if (args.state) {
            this.state = args.state;
        }
        if (args.emoji) {
            this.emoji = args.emoji;
        }
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    updateState(state: MineState) {
        this.state = state;
    }
}

export enum MineState {
    idle,
    active,
    exploded
}