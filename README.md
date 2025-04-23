# GaiaScript: Universal Symbolic Language

GaiaScript is an ultra-compact symbolic language designed for minimal token usage in AI-to-AI communication. It uses Unicode symbols extensively to represent complex operations, neural network architectures, and programming constructs in a highly condensed form.

## Overview

GaiaScript enables efficient communication between AI systems through a rich symbolic notation that maximizes semantic content while minimizing token usage. The language is designed to be platform-agnostic with a universal compiler that can target multiple platforms.

## Project Structure

The project is organized into main directories:

- **docs/** - Documentation and examples
- **comp/** - Universal compiler (Rust/JS)
- **build/** - Build artifacts
- **test/** - Testing environment

## Features

- **Universal Compiler**: Targets JavaScript, WebAssembly, macOS, Windows, Linux, iOS, and Android
- **Ultra-compact Representation**: Express complex ideas with minimal tokens
- **Native ML Support**: Built-in neural networks, transformers, GAN architectures
- **Component-based Design**: Reusable components with symbolic names
- **Interactive Tools**: Playground and Translator interfaces for learning and development

## Example

Here's a simple CNN in GaiaScript notation:

```
N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S
```

And a more complex GAN architecture:

```
N〈G⊕D〉
G:Z⊿≡→U⋱×⋱×⌓⊿⋮→[U⋮×→C⋮⌓⊧ρ]×⋮→C⋰τ
D:I→[C⊧⋱⌓ρ→P⋮]×⋰→F→D₁⊿⊹⋮⋱ρ→D₀⊿σ
L:G(Z)⊳D⟿BCE+λ‖∇D‖
```

## Getting Started

### Command-Line Interface

GaiaScript provides a comprehensive CLI for compiling, running, and managing code:

```bash
# Basic compilation
./gaia run main.gaia

# Compile for web
./gaia build main.gaia --target=web 

# Open interactive playground
./gaia playground

# Open translator tool
./gaia translator

# Extract package
./gaia extract ./output

# Run a web server for the build output
./gaia serve build --open
```

### Supported Platforms

The universal compiler supports multiple target platforms:

- **Web (Default)**: Compiles to JavaScript/HTML
- **macOS**: Generates Swift/AppKit applications
- **Windows**: Creates C#/.NET applications
- **Linux**: Produces C/GTK+ applications
- **iOS**: Builds Swift/UIKit applications
- **Android**: Creates Kotlin/Android applications

Select a platform using the `--target` flag:

```bash
./gaia build main.gaia --target=macos
```

## Tools and Utilities

GaiaScript comes with several interactive tools:

- **Playground**: Interactive code editor for experimenting with GaiaScript
- **Translator**: Convert between GaiaScript, natural language, JavaScript, and Python
- **Universal Compiler**: Cross-platform code generation from a single source
- **Package Format**: Ultra-compact distribution using the `.gaia` extension

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

## Documentation

For detailed information about the language syntax, compiler, and examples, see the `docs/` directory or use the interactive tools with:

```bash
./gaia playground
./gaia translator
```