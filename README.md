# Battleship-coding-tournament
You play Battleship with code. Program your own AI and compete against others.
First, you need to know the rules of the game [Rules](https://www.hasbro.com/common/instruct/battleship.pdf)

# Dependencies
This project was made with Bun. Bun is a simple and fast-build tool for Node.js. You can find more information about Bun [here](https://bun.sh/docs/installation)

Or install bun via NPM:
```bash
npm install -g bun
```

To install the project dependencies:

```bash
bun install
```

# How to Brain
In the folder `/src/brains/` you can find pre-made brains. You can use the brains as starting point for your own AI. The basic brains just do random moves until the game is over.

## How to place ships
In Your brain, you have to implement the *start()* method. This method is called once at the beginning of the game. You have to place all your ships on the board.
```ts
start() {
    // Select the first ship
    const firstShip = this.brainGameData.myShips[0]

    // Call the placeShip method
    const result = this.placeShip({
        // Reference to the ship
        ship: firstShip,
        // X and Y coordinates of the top left corner of the ship
        x: 0,
        y: 0,
        // ShipOrientation.vertical = |
        // ShipOrientation.horizontal = --
        direction: ShipOrientation.horizontal
    })

    // Result is a boolean. If the ship was placed successfully it returns true
    // If false the ship was not placed successfully, maybe the ship is out of bounds
}
```

## How to make a move
In your brain, you have to implement the *turn()* method. This method is called every turn. In this method, you return an X and Y coordinate to hit on your opponent's board. Keep in mind that you can hit the same cell multiple times.
```ts
turn(){
    // Hit a random cell on the enemy playboard
    return {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10)
    }
}
```

## Game data
To know what is happening in the game, you have inside access to brainGameData.
All the data is a deepCopy of the game data and will reset in the next turn.
```ts
this.brainGameData: brainGameData

type brainGameData = {
    myBoard: Playboard,
    myShips: Ship[] | undefined,
    enemyBoard: Playboard | undefined
}
```

### Handy functions in the brainGameData
```ts
 // Your board
this.brainGameData.myBoard

 // Get all cells of your board in a 2D array
this.brainGameData.myBoard.getAllCells()

// Get a 2D array of all cells with a specific state, check the CellState enum for all states
this.brainGameData.myBoard.getCellsByState(enum CellState) 

// Is the 3D array of all cells
this.brainGameData.myBoard.cells 

// Gets a cell at x: 2, y: 3
const cell = this.brainGameData.myBoard.cells[2][3] 

// The state of the cell
cell.state 

// Reference to the ship on the cell (enemy ships are not visible)
cell.shipRef 

// X,Y coordinate of the cell
cell.x
cell.y
```

## How to store some data in your brain
The brain class will be created once at the beginning of the game. You can store data in the brain class and access it in the *start()* and *turn()* methods. Keep in mind that between games, the brain class will be reset and all data will be lost.
```ts
export default class BasicBrain extends Brain {
    // declare a variable in the upper scope of the class
    memory = [];
    otherRandomVariable = 'Hello World';

    turn(){
        // Store some data
        this.memory['myData'] = 'Hello World';

        // Access the data
        console.log(this.memory['myData']);
    }
}
```

## How does the global logger work
The global logger is a simple logger that logs to the console. You can use it to log information about your brain. The logger will print in the game render if enabled.
```ts
import logger from "$utils/logger";
logger.log('Hello World');
logger.warning('Hello World');
logger.error('Hello World');
logger.queue // contains all the logs lines
```

# Running the game
We have two modes to run the game:
- Single game
- Benchmark

## Single game
This mode is for debugging and testing your AI.
```bash
 # Run a single game with two basic brains. First brain is player 1 and seccond brain is player 2
 # The brain name is equal to the filename of the brain you want to load
 ./cli --run --brain basic,basicOptimized

# Run a single game with two basic brains without rendering
./cli --run --brain basic,basicOptimized --disableRender

 # Reload game on each save
./cli --run --brain basic,basicOptimized --dev 

# Step through each turn with enter key
./cli --run --brain basic,basicOptimized --dev --stepMode 

# Disable the logger in the game render
./cli --run --brain basic,basicOptimized --dev --disableLogRender 

# Will a timeout after each turn in ms, note: stepMode will be disabeld
./cli --run --brain basic,basicOptimized --dev --simulationSpeed 1000 
```

## Benchmark
This mode is for when you want to simulate multiple brains against each other to mesure the performance.

The benchmark will run X amount of games in parallel and will match each brain equally against each other to see who wins the most games.

```bash
# Will run the benchmark with multiple brains
./cli --benchmark --brain basic,basic,basic,basicOptimized

# Customize the with of the charts renderd
./cli --benchmark --brain basic,basicOptimized --chartWidth 30

# Run benchmark in dev mode, rerun after file is saved
./cli --benchmark --brain basic,basicOptimized --dev

# Set numbers of threads to run on (parallel games played)
# Default is 4
./cli --benchmark --brain basic,basicOptimized --threads 20

# Set number of itterations, the number of total games played
# Default is 1000
./cli --benchmark --brain basic,basicOptimized  --iterations 10
```

# TODO - What to implement next?
- Web socket server and client
- Web socket leaderboard
- Log Average turn time
- Show system resources used in the benchmark
- Implementing  OpenSkill for benchmark matchmaking