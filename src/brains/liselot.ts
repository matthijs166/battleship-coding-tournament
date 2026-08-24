import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

export default class Liselot extends Brain {
    name = "Liselot";
    memory = {
        lastHit: null as PlayboardCell | null,
        huntMode: false,
        potentialTargets: [] as PlayboardCell[],
        heatmap: Array.from({ length: 10 }, () => Array(10).fill(0)) as number[][]
    };

    start() {
        logger.log("Liselot start");

        if (!this.brainGameData.myShips) {
            logger.error("No ships defined for player");
            return;
        }

        // Place ships randomly with boundary checks
        for (let ship of this.brainGameData.myShips) {
            let placed = false;
            while (!placed) {
                const orientation = Math.random() > 0.5 ? ShipOrientation.horizontal : ShipOrientation.vertical;
                let x = 0;
                let y = 0;

                if (orientation === ShipOrientation.horizontal) {
                    x = Math.floor(Math.random() * (10 - ship.size + 1));
                    y = Math.floor(Math.random() * 10);
                } else {
                    x = Math.floor(Math.random() * 10);
                    y = Math.floor(Math.random() * (10 - ship.size + 1));
                }

                // Check if the ship can be placed at the coordinates without going out of bounds or overlapping
                placed = this.canPlaceShip(ship, x, y, orientation) && this.placeShip({
                    ship,
                    x,
                    y,
                    orientation
                });
            }
        }
    }

    canPlaceShip(ship: any, x: number, y: number, orientation: ShipOrientation): boolean {
        if (orientation === ShipOrientation.horizontal) {
            for (let i = 0; i < ship.size; i++) {
                if (this.brainGameData.myBoard?.cells[y]?.[x + i]?.state !== CellState.empty) {
                    return false;
                }
            }
        } else {
            for (let i = 0; i < ship.size; i++) {
                if (this.brainGameData.myBoard?.cells[y + i]?.[x]?.state !== CellState.empty) {
                    return false;
                }
            }
        }
        return true;
    }

    updateHeatmap() {
        // Reset heatmap
        this.memory.heatmap = Array.from({ length: 10 }, () => Array(10).fill(0));

        // Populate heatmap with probabilities
        const shipLengths = this.brainGameData.myShips?.map(ship => ship.size) || [];

        for (const length of shipLengths) {
            for (let y = 0; y <= 10 - length; y++) {
                for (let x = 0; x < 10; x++) {
                    let horizontalValid = true;
                    let verticalValid = true;
                    for (let i = 0; i < length; i++) {
                        if (this.brainGameData.enemyBoard?.cells[y]?.[x + i]?.state !== CellState.empty) {
                            horizontalValid = false;
                        }
                        if (this.brainGameData.enemyBoard?.cells[y + i]?.[x]?.state !== CellState.empty) {
                            verticalValid = false;
                        }
                    }
                    if (horizontalValid) {
                        for (let i = 0; i < length; i++) {
                            if (this.brainGameData.enemyBoard?.cells[y]?.[x + i]) {
                                this.memory.heatmap[y][x + i]++;
                            }
                        }
                    }
                    if (verticalValid) {
                        for (let i = 0; i < length; i++) {
                            if (this.brainGameData.enemyBoard?.cells[y + i]?.[x]) {
                                this.memory.heatmap[y + i][x]++;
                            }
                        }
                    }
                }
            }
        }
    }

    getBestCell(): PlayboardCell | null {
        this.updateHeatmap();
        let maxProb = 0;
        let bestCells: PlayboardCell[] = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const cell = this.brainGameData.enemyBoard?.cells[y]?.[x];
                if (cell && cell.state === CellState.empty) {
                    const prob = this.memory.heatmap[y][x];
                    if (prob > maxProb) {
                        maxProb = prob;
                        bestCells = [cell];
                    } else if (prob === maxProb) {
                        bestCells.push(cell);
                    }
                }
            }
        }

        if (bestCells.length > 0) {
            return bestCells[Math.floor(Math.random() * bestCells.length)];
        }

        return null;
    }

    getAdjacentCells(cell: PlayboardCell): PlayboardCell[] {
        const { x, y } = cell;
        const adjacentCells: (PlayboardCell | undefined)[] = [];

        if (x > 0) adjacentCells.push(this.brainGameData.enemyBoard?.cells[y]?.[x - 1]);
        if (x < 9) adjacentCells.push(this.brainGameData.enemyBoard?.cells[y]?.[x + 1]);
        if (y > 0) adjacentCells.push(this.brainGameData.enemyBoard?.cells[y - 1]?.[x]);
        if (y < 9) adjacentCells.push(this.brainGameData.enemyBoard?.cells[y + 1]?.[x]);

        return adjacentCells.filter(cell => cell && cell.state === CellState.empty) as PlayboardCell[];
    }

    turn() {
        let targetCell: PlayboardCell | null = null;

        if (this.memory.huntMode && this.memory.potentialTargets.length > 0) {
            targetCell = this.memory.potentialTargets.pop() || null;
        } else {
            targetCell = this.getBestCell();
        }

        if (!targetCell) {
            return { x: 0, y: 0 };
        }

        // Update memory based on hit/miss
        const { x, y } = targetCell;
        const cellState = this.brainGameData.enemyBoard?.cells[y]?.[x]?.state;

        if (cellState === CellState.hit || cellState === CellState.ship) {
            this.memory.huntMode = true;
            this.memory.potentialTargets.push(...this.getAdjacentCells(targetCell));
        } else if (cellState === CellState.miss) {
            this.memory.huntMode = this.memory.potentialTargets.length > 0;
        }

        return { x: targetCell.x, y: targetCell.y };
    }
}