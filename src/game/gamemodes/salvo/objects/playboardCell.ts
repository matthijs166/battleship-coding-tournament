import type Ship from "./ship";
import type Mine from "./mine";

export default class PlayboardCell{
    x: number;
    y: number;
    state: CellState = CellState.unkown;
    emoji: string = CellEmojiDisplay.unkown;
    shipRef: Ship | null = null;
    mineRef: Mine | null = null;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    updateState(newState: CellState){
        if (this.state === CellState.unkown && newState !== CellState.mine && newState !== CellState.ship) {
            this.state = CellState.empty;
        } else {
            this.state = newState;
        }
        this.emoji = this.getEmoji();
    }

    getEmoji(){
        switch(this.state){
            case CellState.empty:
                return CellEmojiDisplay.empty;
            case CellState.hit:
                return CellEmojiDisplay.hit;
            case CellState.miss:
                return CellEmojiDisplay.miss;
            case CellState.ship:
                return this.shipRef?.emoji || CellEmojiDisplay.ship;
            case CellState.unkown:
                return CellEmojiDisplay.unkown;
            case CellState.mine:
                return CellEmojiDisplay.mine;
        }
    }

    setShipRef(ship: Ship){
        this.shipRef = ship;
        this.updateState(CellState.ship);
    }

    setMineRef(mine: Mine) {
        this.mineRef = mine;
        this.updateState(CellState.mine);
    }
}

export enum CellState {
    empty = "empty",
    ship = "ship",
    hit = "hit",
    miss = "miss",
    unkown = "unkown",
    mine = "mine"
}

enum CellEmojiDisplay {
    empty = "🟦",
    ship = "🚢",
    hit = "💥",
    miss = "⬜",
    unkown = "❔",
    mine = "💣"
}