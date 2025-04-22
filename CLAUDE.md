# GaiaScript Project Guidelines

## Build and Execution
- `cargo build` - Build the project
- `cargo run -- run examples/cnn.gaia` - Run a GaiaScript program
- `cargo run -- parse examples/cnn.gaia` - Parse and print the AST
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
- Always validate network structure before execution