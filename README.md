# GaiaScript

GaiaScript is an ultra-compact symbolic language designed for minimal token usage in AI-to-AI communication.

## Project Structure

The project is organized into main directories:

- **docs/** - Documentation and examples
- **comp/** - Compiler components
- **build/** - Build artifacts
- **test/** - Testing environment

## Features

- Symbolic notation for neural networks
- Compact representation of complex architectures
- Support for CNNs, GANs, Transformers, and more
- Multiple compiler targets:
  - JavaScript/Web
  - React and Flutter for mobile/web
  - Native macOS applications
  - WebAssembly (WASM)
  - Native code via LLVM
  - Assembly (x86_64, arm64)

## Getting Started

See the [documentation](docs/README.md) for more details on using GaiaScript.

## Example

Here's a simple CNN in GaiaScript notation:

```
N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S
```

## Building

To compile GaiaScript:

```
node comp/build.js
```

## Testing Environment

GaiaScript includes a comprehensive testing environment optimized for:

- AI-to-AI communication
- Evolutionary development
- UI interaction and testing
- Test-driven development (TDD)
- Automated error correction

The testing environment provides:

- Fast parsing and execution of GaiaScript code
- AI-driven code mutation strategies
- UI rendering and interaction testing
- Evolution through genetic algorithms
- Comprehensive test suite for all GaiaScript features

See the [test environment documentation](docs/test-environment.md) for details.

### Running Tests

```bash
cd test
npm install
node run.js test --file=examples/basic-tests.gaia
```

### Visualizing Results

A web-based dashboard is available to visualize test results:

```bash
cd test/dashboard
# Open index.html in your browser
```