import Brain from "$game/objects/brain";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";
import type { attackTypes, Turn } from "$game/objects/brain";
import fs from 'fs';
import path from 'path';

export default class RadarBrain extends Brain {
    name = "radar Brain";
    memory = {
        lasthit: undefined as { x: number, y: number } | undefined,
        radarPosition: { x: 0, y: 0 }, // Add radarPosition to memory
        lastRadarHit: undefined as { x: number, y: number, results: any } | undefined // Add lastRadarHit to memory
    };

    start(){
        logger.log("radar Brain start");
                
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
        
                        placed = this.placeShip({
                            ship,
                            x,
                            y,
                            orientation
                        });
                    }
                }
        
                if (!this.brainGameData.myMines) {
                    logger.error("No mines defined for player");
                    return;
                }
                for (let mine of this.brainGameData.myMines){
        
                    let placed = false;
                    while (!placed) {
                        const x = Math.floor(Math.random() * 10);
                        const y = Math.floor(Math.random() * 10);
        
                            placed = this.placeMine({
                                mine,
                                x,
                                y
                            });
                    }
                }
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

        if (this.memory.radarPosition) {
            const cellState = this.memory.lastRadarHit;
            const filePath = path.join(__dirname, 'cellState.json');
            fs.writeFileSync(filePath, JSON.stringify({ cellState }, null, 2));
            return this.scanWithRadar() as Turn;
        }
        return this.scanWithRadar() as Turn;
    }
}
