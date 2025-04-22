# GaiaScript Project Guidelines

## Build and Execution
- `cargo build` - Build the project
- `cargo run -- run examples/cnn.gaia` - Run a GaiaScript program
- `cargo run -- parse examples/cnn.gaia` - Parse and print the AST
- `cargo run -- serve` - Start the web server for the MorphSphere game
- `cargo test` - Run all tests
- `cargo test -- interpreter::tests::test_layer_interpretation` - Run specific test

## Code Style Guidelines
- **Imports**: Group by: 1) Rust standard library 2) External crates 3) Project modules
- **Formatting**: 4-space indentation, 100 char line limit
- **Types**: 
  - AST nodes in ast.rs
  - Symbol definitions in aopl.pest
  - Interpreter components in interpreter.rs
- **Naming**: 
  - PascalCase for types/enums
  - snake_case for functions/variables
  - UPPER_SNAKE_CASE for constants
- **Error Handling**: Use Result with specific error types
- **Parser**: Pest grammar-based parser for symbolic language

## Language Implementation
- Symbol definitions are in aopl.pest
- Core AST types in ast.rs
- Implementation of operations in interpreter.rs
- Web implementation in web_server.rs and web/ directory
- Always validate network structure before execution

## MorphSphere Game
- Web-based surreal 3D environment built on GaiaScript
- Run with `cargo run -- serve` and open http://localhost:8080
- JavaScript/Three.js frontend in web/ directory
- Demonstrates AI-optimized language concepts visually