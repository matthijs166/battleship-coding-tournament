import Brain from "$game/objects/brain";
import PlayboardCell, { CellState } from "$game/objects/playboardCell";
import { ShipOrientation } from "$game/objects/ship";
import logger from "$utils/logger";

type Coordinate = {
    x: number;
    y: number;
}

type AttackDirection = "up" | "down" | "left" | "right";
 
type Attack = {
    initialHit: Coordinate;
    moves: Coordinate[];
    currentDirection: AttackDirection;
    directionsToTraverse: AttackDirection[];
    traversedDirections: AttackDirection[];
    finished: boolean;
}

type Memory = {
    prevPosition: Coordinate | undefined;
    attacks: Attack[];
    strikeMap: number[][];
}

export default class MrBackend extends Brain {
    name = "MrBackend";
    memory: Memory = {
        prevPosition: undefined,
        attacks: [],
        strikeMap: [
            [2, 3, 1, 2, 3, 1, 2, 3, 1, 2],
            [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
            [3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
            [2, 3, 1, 2, 3, 1, 2, 3, 1, 2],
            [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
            [3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
            [2, 3, 1, 2, 3, 1, 2, 3, 1, 2],
            [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],
            [3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
            [2, 3, 1, 2, 3, 1, 2, 3, 1, 2]
        ]
    };

    start(){
        logger.log("MrBackend start");
        this.placeShip({ // 5 
            ship: this.brainGameData.myShips![0],
            y: 2,
            x: 2,
            orientation: ShipOrientation.vertical
        })
        this.placeShip({ // 4
            ship: this.brainGameData.myShips![1],
            x: 2,
            y: 6,
            orientation: ShipOrientation.vertical
        })
        this.placeShip({ // 3
            ship: this.brainGameData.myShips![2],
            x: 0,
            y: 7,
            orientation: ShipOrientation.horizontal
        })
        this.placeShip({ // 3
            ship: this.brainGameData.myShips![3],
            x: 9,
            y: 0,
            orientation: ShipOrientation.horizontal
        })
        this.placeShip({ // 2
            ship: this.brainGameData.myShips![4],
            x: 8,
            y: 5,
            orientation: ShipOrientation.horizontal
        })
    }

    findCoordinateInAttack(coordinate: Coordinate): Attack | undefined {
        return this.memory.attacks.find((a) => !a.finished && a.moves.find((m) => m.x === coordinate.x && m.y === coordinate.y));

    }

    getCellState(c: Coordinate) : CellState {
        return this.brainGameData.enemyBoard?.cells[c.x][c.y].state || CellState.empty;
    }

    getSearchCell() : Coordinate {
        let cells = this.memory.strikeMap
            .map((row, x) => row.map((value, y) => ({ x, y, value })))
            .flat()
            .filter((cell) => this.getCellState(cell) === CellState.empty)
            .sort((a, b) => b.value - a.value);

        if (cells.length === 0) {
            logger.error("No empty cells found in search map");
        }

        this.memory.prevPosition = {
            x: cells[0].x,
            y: cells[0].y
        }

        return this.memory.prevPosition;
    }

    calculateNextMove(attack: Attack) : Coordinate | undefined {
        const lastMove = attack.moves[attack.moves.length - 1];
        let referenceMove = lastMove;

        // If last move was a miss, remove direction from directions to traverse and set current direction to next direction
        if (this.getCellState(lastMove) !== CellState.hit) {
            attack.directionsToTraverse = attack.directionsToTraverse.filter((d) => d !== attack.currentDirection);
            
            if (attack.directionsToTraverse.length === 0) {
                attack.finished = true;
                return undefined;
            } else {
                attack.currentDirection = attack.directionsToTraverse[0];
                referenceMove = attack.initialHit;
            }
        } else if (this.getCellState(lastMove) === CellState.hit) {
            attack.traversedDirections.push(attack.currentDirection);
        }

        let finished = false;
        let nextMove = undefined;


        while(!finished) {
            switch(attack.currentDirection) {
                case "left":
                    nextMove = { x: referenceMove.x, y: referenceMove.y - 1 };
                    break;
                case "right":
                    nextMove = { x: referenceMove.x, y: referenceMove.y + 1 };
                    break;
                case "up":
                    nextMove = { x: referenceMove.x - 1, y: referenceMove.y };
                    break;
                case "down":
                    nextMove = { x: referenceMove.x + 1, y: referenceMove.y };
                    break;
            }

            // Check if the next move is out of bounds
            if (nextMove.x < 0 || nextMove.x > 9 || nextMove.y < 0 || nextMove.y > 9 || this.getCellState(nextMove) !== CellState.empty) {
                // If so, remove direction from directions to traverse and set current direction to next direction
                attack.directionsToTraverse = attack.directionsToTraverse.filter((d) => d !== attack.currentDirection);

                if (attack.directionsToTraverse.length === 0) {
                    attack.finished = true;
                    finished = true;
                    return undefined;
                } else {
                    attack.currentDirection = attack.directionsToTraverse[0];
                }
            } else  {
                finished = true;
            }
        }

        return nextMove; 
    }


    getCell() : Coordinate {
        if (!this.memory.prevPosition) {
            return this.getSearchCell();
        }

        // Check if previous attack was a hit and was part of an attack
        let currentAttack = this.findCoordinateInAttack(this.memory.prevPosition);
        const prevCellSuccess = this.getCellState(this.memory.prevPosition) === CellState.hit;
        
        if (!currentAttack && prevCellSuccess) {
            // Create new attack
            currentAttack = {
                initialHit: this.memory.prevPosition,
                moves: [this.memory.prevPosition],
                currentDirection: "right",
                directionsToTraverse: ["right", "left", "up", "down"],
                traversedDirections: [],
                finished: false,
            }
            this.memory.attacks.push(currentAttack);
        }

        if (!currentAttack) {
            return this.getSearchCell();
        }

        let nextMove: Coordinate | undefined = this.calculateNextMove(currentAttack!);

        if (nextMove) {
            currentAttack!.moves.push(nextMove);
            this.memory.prevPosition = nextMove;
            return nextMove;
        } else {
            return this.getSearchCell();
        }
    }

    turn(){
        return this.getCell();
    }
}
