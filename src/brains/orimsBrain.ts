import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";
import type { attackTypes, Turn } from "$game/objects/brain";
import fs from 'fs';
import path from 'path';

export default class OrimsBrain extends Brain {
    name = "orims Brain";
    memory = {
        lasthit: undefined as { x: number, y: number } | undefined,
        placedship: [] as { x: number, y: number, orientation: ShipOrientation }[],
        placedmine: [] as { x: number, y: number }[],
        shots: [] as { x: number, y: number }[],
        crossLimits: 4,
        bombLimits: 2,
        radarLimits: 1, // Add radar limit to memory
        hitShips: [] as { x: number, y: number }[], // Add hitShips to memory
        radarPosition: { x: 0, y: 0 }, // Add radarPosition to memory
        lastRadarHit: undefined as { x: number, y: number, results: any } | undefined // Add lastRadarHit to memory
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

        if (!this.brainGameData.myMines) {
            logger.error("No mines defined for player");
            return;
        }

        // loop mines and try to place them randomly until all mines are placed
        for (let mine of this.brainGameData.myMines) {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                
                // Check if the new mine placement is too close to existing mines
                const isTooClose = this.memory.placedmine.some(placedmine => {
                    const distanceX = Math.abs(placedmine.x - x);
                    const distanceY = Math.abs(placedmine.y - y);
                    return distanceX <= 1 && distanceY <= 1;
                });
                
                // Check if there is a ship in the target cell
                const isShipPresent = this.memory.placedship.some(placedShip => {
                    return placedShip.x === x && placedShip.y === y;
                });

                if (isTooClose || isShipPresent) continue;

                // if (this.memory.maxmines > 0) {
                //     this.memory.maxmines--;
                    placed = this.placeMine({
                        mine,
                        x,
                        y
                    });
                // }

                if (placed) {
                    this.memory.placedmine.push({ x, y });
                    // this.memory.maxmines - 1;
                    // if (this.memory.maxmines <= 0){
                    //     return; // Add return statement to exit the loop
                    // }
                }
            }
        }
    }

    getOpenCells() {
        const openCells = this.brainGameData.enemyBoard?.getCellsByState(CellState.unkown) || this.brainGameData.enemyBoard?.getCellsByState(CellState.empty) || [];
        return openCells;
    }
    getState(e: { x: number, y: number }): CellState {
        return this.brainGameData.enemyBoard?.cells[e.x][e.y].state || CellState.unkown;
    }
    scanWithRadar() {
        const { x, y } = this.memory.radarPosition;
        const target = { x, y, attack: "radar" as attackTypes };

        // Update radar position for the next turn
        if (x < 9) {
            this.memory.radarPosition.x++;
        } else if (x === 9 && y < 9) {
            this.memory.radarPosition.x = 0;
            this.memory.radarPosition.y++;
        } else {
            this.memory.radarPosition = { x: 0, y: 0 }; // Reset to start if at the end
        }

        return target;
    }

    turn(): Turn {
        if (this.memory.radarLimits > 0) {
            const openCells = this.getOpenCells();
            if (openCells.length === 0) {
                logger.error("No open cells available");
                return { x: 0, y: 0, attack: "default" };
            }
            const randomIndex = Math.floor(Math.random() * openCells.length);
            const target = openCells[randomIndex];
            this.memory.radarLimits--;
            const radarTurn = { x: target.x, y: target.y, attack: "radar" as attackTypes };
            this.memory.lasthit = target;
            return radarTurn;
        }

        if (!this.memory.lasthit) {
            const openCells = this.getOpenCells();
            if (openCells.length === 0) {
                logger.error("No open cells available");
                return { x: 0, y: 0, attack: "default" };
            }
            const randomIndex = Math.floor(Math.random() * openCells.length);
            const target = openCells[randomIndex];
            this.memory.lasthit = target;
            return this.chooseAttack(target, false);
        }

        let openCells = this.getOpenCells();
        if (openCells.length === 0) {
            logger.error("No open cells available");
            return { x: 0, y: 0, attack: "default" };
        }

        let target;

        if (this.getState(this.memory.lasthit) === CellState.hit) {
            this.memory.hitShips.push(this.memory.lasthit); // Store hit ship
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
        } else {
            // Step back if the last hit was not a ship
            while (this.memory.hitShips.length > 0) {
                this.memory.lasthit = this.memory.hitShips.pop();
                if (this.memory.lasthit && 
                    (this.getState(this.memory.lasthit) === CellState.hit || 
                        this.getState(this.memory.lasthit) === CellState.unkown || 
                        this.getState(this.memory.lasthit) === CellState.empty)) {
                    return this.turn(); // Retry turn with the previous hit
                }
            }
            // If all hitShips are empty or unknown, continue with other functions
            this.memory.lasthit = undefined;
            return this.turn();
        }

        if (!target) {
            let randomIndex = Math.floor(Math.random() * openCells.length);
            target = openCells[randomIndex];
        }

        this.memory.lasthit = target;
        return this.chooseAttack(target, true);
    }

    chooseAttack(target: { x: number, y: number }, isKnownShip: boolean): Turn {
        const attackType = Math.random();
        let radarLimits = this.memory.radarLimits; // Use local variable for radar limit
        let attack: attackTypes = "default";

        if (isKnownShip) {
            if (attackType < 0.2 && this.memory.crossLimits > 0) {
                attack = "cross";
                this.memory.crossLimits--;
            } else if (attackType < 0.4 && this.memory.bombLimits > 0) {
                attack = "bomb";
                this.memory.bombLimits--;
            } else if (attackType < 0.05 && radarLimits > 0) { // Very low chance for radar
                attack = "radar";
                radarLimits--;
            }
        }
        return { x: target.x, y: target.y, attack };
    }
}
