# MorphSphere - A Surreal 3D AI Game

This web interface provides a playable version of MorphSphere, a surreal 3D game created using GaiaScript. The game demonstrates the concepts of the AI-Optimized Programming Language (AOPL) by allowing real-time interaction with the abstract neural network definitions.

## How to Run

1. Start the web server from the root of the project:
   ```
   cargo run -- serve
   ```

2. Open your browser and go to `http://localhost:8080`

## Game Controls

- **Mouse:** Look around the environment
- **Click on Morphs:** Select them for interaction
- **Capture Essence:** Absorb a morph to gain energy and essence
- **Merge:** Combine two morphs to create a more complex form
- **Create Sound:** Spend energy to create a sound node that attracts new morphs

## GaiaScript Integration

The GaiaScript editor at the bottom of the screen allows you to experiment with the AOPL language. The editor shows the neural network definitions that shape the game:

- **W (World Generator):** Creates the morphing, surreal landscape
- **A (Agent Intelligence):** Controls the autonomous morphs
- **P (Player Perception):** Handles interaction between player and environment

When you click "Run Script", the code is sent to the GaiaScript interpreter and the results are visualized in the 3D environment.

## Technical Details

The web interface combines:

1. **Three.js:** For 3D rendering and WebGL support
2. **Custom Shaders:** For the surreal, morphing terrain
3. **GaiaScript Interpreter:** Running on the server via Rust
4. **Real-time Visualization:** Showing how neural networks can generate interactive environments

Enjoy exploring the abstract, surreal world of MorphSphere!