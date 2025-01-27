import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";
import type { Turn } from "$game/objects/brain";

export default class OrimsBrain extends Brain {
    name = "orims Brain";
    memory = {
        lasthit: undefined as { x: number, y: number } | undefined,
        placedship: [] as { x: number, y: number, orientation: ShipOrientation }[],
        shots: [] as { x: number, y: number }[]
    };

    start(){
        logger.log("orims brain start");
        
        // if this.brainGameData.myShips not defined, return
        if (!this.brainGameData.myShips){
            logger.error("No ships defined for player");
            return;
        }

        // loop ships and try to place them randomly until all ships are placed
        for (let ship of this.brainGameData.myShips){
            let placed = false;
            while(!placed){
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const orientation = Math.random() > 0.5 ? ShipOrientation.horizontal : ShipOrientation.vertical;

                // Check if the new ship placement is too close to existing ships
                const isTooClose = this.memory.placedship.some(placedShip => {
                    const distanceX = Math.abs(placedShip.x - x);
                    const distanceY = Math.abs(placedShip.y - y);
                    return distanceX <= 1 && distanceY <= 1;
                });

                if (isTooClose) continue;

                placed = this.placeShip({
                    ship,
                    x,
                    y,
                    orientation
                });

                if (placed) {
                    this.memory.placedship.push({ x, y, orientation });
                }
            }
        }

    }

    getOpenCells() {
        const openCells = this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];
        return openCells;
    }

    turn(): Turn {
        if (!this.memory.lasthit) {
            const openCells = this.getOpenCells();
            if (openCells.length === 0) {
                logger.error("No open cells available");
                return { x: 0, y: 0, attack: "default" };
            }
            const randomIndex = Math.floor(Math.random() * openCells.length);
            const target = openCells[randomIndex];
            this.memory.lasthit = target;
            return { x: target.x, y: target.y, attack: "bomb" };
        }

        let openCells = this.getOpenCells();
        if (openCells.length === 0) {
            logger.error("No open cells available");
            return { x: 0, y: 0, attack: "default" };
        }

        let target;

        if (this.memory.lasthit) {
            let hit = this.memory.lasthit;
            let potentialTargets = [
                { x: hit.x + 1, y: hit.y },
                { x: hit.x - 1, y: hit.y },
                { x: hit.x, y: hit.y + 1 },
                { x: hit.x, y: hit.y - 1 }
            ];

            target = potentialTargets.find(cell => 
                openCells.some(openCell => openCell.x === cell.x && openCell.y === cell.y)
            );
        }

        if (!target) {
            let randomIndex = Math.floor(Math.random() * openCells.length);
            target = openCells[randomIndex];
        }

        this.memory.lasthit = target;
        return { x: target.x, y: target.y, attack: "bomb" };
    }
}
