# Holberton-IO Game

### ```Every move, your choice```

Welcome to Holberton-IO, a territory-claiming game where players compete to have the most land when the game time runs out. Be strategic and watch out for other players who might cross your trail!

## Table of Contents

- [About the Game](#about-the-game)
- [Project Structure and Technologies](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Conclusion](#license)

## About the Game

Welcome to Holberton-IO, an engaging and strategic territory-claiming game that combines skill and wit! In Holberton-IO, players embark on a journey to dominate the game world by moving strategically, creating trails, and enclosing plots of land to claim as their own. The ultimate objective is to accumulate the most land by the time the game clock runs out.

### Gameplay Overview

#### Claiming Territory

Players navigate the game environment, leaving behind trails as they move. These trails serve as the boundaries of their claimed territories. The larger the enclosed area, the more land a player can accumulate.

#### Strategic Movement

Success in Holberton-IO hinges on strategic movement. Players must carefully plan their routes, considering both offense and defense. While expanding their territory, players must also be mindful of the positions of other players to avoid collisions.

#### Watch Out for Opponents

Beware of other players actively vying for dominance in the game. If an opponent crosses your trail, you'll lose all the land you've meticulously collected. This introduces an element of competition and urgency, adding an exciting layer to the gameplay.

### Key Features

- **Territory Claiming:** Strategically move to claim territory and expand your land holdings.
- **Trail Creation:** Leave behind trails as you move, marking the boundaries of your claimed areas.
- **Enclosing Plots:** Gain ownership of plots of land by enclosing them with your trails.
- **Competition:** Watch out for other players who can jeopardize your land holdings by crossing your trail.
- **Time-Based Challenge:** The game is against the clock, and the player with the most land claimed when the time runs out emerges as the ultimate victor.

### How to Win

The primary goal in Holberton-IO is to secure the highest amount of claimed land when the game timer reaches zero. Successful players strike a balance between aggressive expansion and defensive maneuvers to outsmart their opponents and emerge victorious.

Prepare for an exciting and challenging gaming experience in Holberton-IO, where every move counts, and territorial dominance is the key to success!

## Project Structure and Technologies

Holberton-IO employs a strong project structure and leverages cutting-edge technologies to deliver an immersive multiplayer gaming experience. The combination of Python for server-side logic and game components, along with JavaScript for the client-side interface and game interactions, forms the backbone of our game development. Let's delve into the project structure and the technologies used in detail.

### Project Structure

#### Server-Side (gameserver)

The server-side of Holberton-IO is structured to handle the game's core logic, real-time communication, and data management.

- **client.py:** Manages the game client on the server side.
- **game_loop.py:** Implements the main game loop logic, crucial for real-time updates.
- **game_server.py:** Sets up and runs the game server, handling connections and orchestrating gameplay.
- **game:**
  - **line.py:** Defines the line object used in the game.
  - **map.py:** Manages the game map and territory.
  - **player.py:** Handles player-related functionality.
  - **rect.py:** Defines the rectangular object in the game.
  - **vector.py:** Implements vector operations.

- **network:**
  - **packet.py:** Defines the structure of network packets, facilitating communication.
  - **packets:**
    - Various packet types used in communication, such as age, direction, fill_area, name, ping, player_state, pong, ready, and waiting_blocks.
  - **socket.py:** Manages WebSocket communication for real-time updates.
  - **utils:**
    - **reader.py:** Provides utilities for reading data from the network.
    - **writer.py:** Provides utilities for writing data to the network.

- **utils:**
  - **block_compressions.py:** Handles block compression functionality for efficient data transmission.
  - **colors.py:** Defines colors used in the game.
  - **game.py:** Contains miscellaneous game-related functions.
  - **game_math.py:** Implements mathematical functions used in the game.

#### Client-Side (src)

The client-side code is responsible for rendering the game interface, handling user interactions, and communicating with the server.

- **app.js:** Main application logic for the client.
- **controls.js:** Manages user controls, enabling smooth gameplay.
- **game-engine.js:** Implements the game engine, handling rendering and game mechanics.
- **network:**
  - **client.js:** Manages the game client on the client side.
  - **packet.js:** Defines the structure of network packets on the client side.
  - **packets:**
    - Various packet types used on the client side, such as age, direction, fill_area, namePacket, ping, playerState, pong, ready, and waitingBlocks.
  - **socket.js:** Manages WebSocket communication for real-time updates on the client side.
  - **utils:**
    - **bytes-utils.js:** Provides utilities for handling bytes efficiently.
    - **reader.js:** Provides utilities for reading data from the network.
    - **writer.js:** Provides utilities for writing data to the network.

- **ui:**
  - **objects:**
    - Various objects used in the user interface, such as block, camera, canvas, player, point, and rectangle.
  - **utils.js:** Contains utility functions for the user interface.

- **utils:**
  - **math.js:** Implements mathematical functions used on the client side.
### Technologies

#### Python

Python is utilized for the server-side logic and game components. Its simplicity and versatility make it well-suited for handling complex game mechanics and real-time communication.

#### JavaScript

JavaScript is employed for the client-side interface and game interactions. It allows for dynamic and responsive user interfaces, enhancing the overall gaming experience.

#### WebSockets

WebSockets play a crucial role in facilitating real-time bidirectional communication between the server and clients. This technology enables seamless and instantaneous updates, essential for the dynamic nature of multiplayer gaming.

#### Packet-Based Communication

The game utilizes a packet-based communication system over WebSockets. This involves sending and receiving structured data between the server and clients. Each packet type serves a specific purpose, such as updating player positions, handling game state changes, and more.

#### Network Utilities

Custom network utilities are implemented to efficiently read and write data to and from the network. These utilities ensure smooth and reliable communication between the server and clients.

Holberton-IO leverages these technologies and a well-organized project structure to deliver a captivating multiplayer gaming experience. Whether you are navigating the server-side logic in Python or enjoying the responsive client-side interface in JavaScript, the synergy of these technologies contributes to the game's overall success.

## Getting Started

To get started with Holberton-IO, follow these steps to set up the project and run the server. Ensure you have Python, npm, and the necessary dependencies installed on your system.

### Prerequisites

Before running the project, make sure you have the following prerequisites installed:

- [Python](https://www.python.org/downloads/): Version 3.6 or later.
- [npm](https://www.npmjs.com/get-npm): The Node.js package manager.

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/Holberton-IO/helberton.io.git
2. Navigate to the project directory:
   ```bash 
   cd project
3. Create a virtual environment:
   ```bash 
    python -m venv env
4. Activate the virtual environment:
   ```bash 
    source env/bin/activate
5. Install Python dependencies:
   ```bash 
    pip install -r req.txt
6. Install npm dependencies:
   ```bash 
    npm install
7. Bundle the JavaScript files
   ```bash 
    ./bundle.sh
#### Running the Server
Now that you've set up the project, start the server. Open a new terminal window and run the following command:
    ```python server.py```

The server should start running, and you can access the game by navigating to the provided URL in your web browser.


## Usage

Holberton-IO offers an intuitive and interactive gameplay experience. Follow these instructions to navigate and enjoy the game:

1. **Accessing the Game:**
   - Open a web browser and navigate to the provided URL where the game is hosted.

2. **Game Interface:**
   - Familiarize yourself with the game interface, including the territory map, player positions, and other relevant game elements.

3. **Controls:**
   - Use the specified controls to maneuver your player character within the game environment.
   - [Specify controls here, e.g., arrow keys for movement, spacebar for a special action, etc.]

4. **Claiming Territory:**
   - Move strategically to create trails and enclose plots of land.
   - The more extensive the enclosed area, the more land you accumulate.

5. **Watch Out for Opponents:**
   - Stay vigilant and avoid colliding with trails created by other players.
   - Collisions result in losing all the land you've collected, so plan your movements carefully.

6. **Game Timer:**
   - Be aware of the game timer, and aim to have the most land claimed by the time it runs out.
   - The player with the highest land ownership at the end of the game is declared the winner.

7. **Enjoy the Multiplayer Experience:**
   - Holberton-IO is designed for multiplayer interaction, so immerse yourself in the competitive and dynamic gameplay with other users.

8. **Experiment and Have Fun:**
   - Experiment with different strategies, explore the game world, and most importantly, have fun claiming territory and competing with other players.

Feel free to customize these instructions based on your game's specific controls and features. Now, dive into Holberton-IO, and may the best strategist claim victory!


## Contributing

Feel free to contribute to the Holberton-IO project! Your contributions help enhance the gaming experience for everyone.

## Conclusion

Thank you for exploring Holberton-IO! We hope you enjoy the engaging gameplay, strategic challenges, and the real-time multiplayer experience our game has to offer. Whether you're a player claiming territory or a developer contributing to the project, your involvement is what makes Holberton-IO exciting and dynamic.

If you have feedback, suggestions, or if you encounter any issues, please don't hesitate to [open an issue](https://github.com/Holberton-IO/helberton.io/issues). We appreciate your input as we strive to make Holberton-IO even better.

```Happy gaming and contributing :)``` 🎮
