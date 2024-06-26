import logger from "$utils/logger";
import Playboard from "./objects/playboard";
import Ship, { ShipOrientation, shipTypes } from "./objects/ship";

const playboard = new Playboard();


// place first ship
playboard.placeShip({
    ship: new Ship({
        type: shipTypes.carrier,
        size: 5
    }),
    x: 0,
    y: 0,
    orientation: ShipOrientation.vertical
});

// place second ship
playboard.placeShip({
    ship: new Ship({
        type: shipTypes.battleship,
        size: 4
    }),
    x: 2,
    y: 2,
    orientation: ShipOrientation.horizontal
});

// place third ship
playboard.placeShip({
    ship: new Ship({
        type: shipTypes.cruiser,
        size: 3
    }),
    x: 4,
    y: 4,
    orientation: ShipOrientation.vertical
});

// place fourth ship
playboard.placeShip({
    ship: new Ship({
        type: shipTypes.submarine,
        size: 3
    }),
    x: 6,
    y: 6,
    orientation: ShipOrientation.vertical
});

// place fifth ship
playboard.placeShip({
    ship: new Ship({
        type: shipTypes.destroyer,
        size: 2
    }),
    x: 8,
    y: 8,
    orientation: ShipOrientation.horizontal
});

// print playboard


logger.log("All ships placed on the playboard");

playboard.receiveAttack(0, 0);

playboard.receiveAttack(8, 2);
playboard.receiveAttack(8, 2);

playboard.receiveAttack(8, 8);
playboard.receiveAttack(8, 9);


playboard.printPlayboard();
logger.printAll();