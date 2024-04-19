import logger from "$utils/logger";
import Playboard from "./objects/playboard";
import Fleet, { ShipOrientation } from "./objects/ship";

const playboard = new Playboard();

const fleet = new Fleet();

// place first ship
playboard.placeShip({
    ship: fleet.ships[0],
    x: 0,
    y: 0,
    orientation: ShipOrientation.vertical
});

// place second ship
playboard.placeShip({
    ship: fleet.ships[1],
    x: 2,
    y: 2,
    orientation: ShipOrientation.horizontal
});

// place third ship
playboard.placeShip({
    ship: fleet.ships[2],
    x: 4,
    y: 4,
    orientation: ShipOrientation.vertical
});

// place fourth ship
playboard.placeShip({
    ship: fleet.ships[3],
    x: 6,
    y: 6,
    orientation: ShipOrientation.vertical
});

// place fifth ship
playboard.placeShip({
    ship: fleet.ships[4],
    x: 8,
    y: 8,
    orientation: ShipOrientation.horizontal
});

// print playboard


logger.log("All ships placed on the playboard");

playboard.targetCell(0, 0);

playboard.targetCell(8, 2);
playboard.targetCell(8, 2);

playboard.targetCell(8, 8);
playboard.targetCell(8, 9);


playboard.printPlayboard();
logger.printAll();