# GaiaScript: AI-Optimized Programming Language (AOPL)

GaiaScript is an implementation of AOPL, a symbolic programming language designed for AI-to-AI communication with minimal token usage and maximum information density. It includes a JavaScript compiler and web-based visualization.

## Features

- **Ultra-compact symbolic syntax** for defining neural network architectures
- **Pipeline-oriented syntax** for data flow operations
- **Context-aware grammar** where operators derive meaning from position and context
- **Specialized for AI workloads** with built-in tensor operations and ML concepts
- **Web visualization** for interactive exploration of neural architectures
- **JavaScript compiler** for client-side execution

## Examples

### CNN Image Classifier

```
N ⊻ I ⊸ μ σ → C₁ 32 5 ρ → R → P 2 → C₂ 64 3 ρ → R → P 2 → F → D₁ 128 R → D₀ 10 → S
```

### GAN Architecture

```
N〈G⊕D〉
G: Z 100 → U 4×4×512 → [U 2× → C 256 ρ]×2 → C 3 τ
D: I → [C 64 5 ρ → P 2]×3 → F → D₁ 1024 ρ → D₀ 1 σ
L: G(Z)⊳D⟿BCE+λ‖∇D‖
```

### MorphSphere Game Model

```
N〈G⊕W⊕M⊕C〉
G: I → C 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 7 → S 
W: Z 512 → U 16×16×32 → C 64 3 ρ → U 2× → C 32 3 ρ → R
M: Z 128 → D₁ 64 ρ → D₁ 32 ρ → R 4×4×2 → U 2× → C 8 3 ρ
C: M⊳G⟿MSE
```

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Web browser with JavaScript enabled

### Installation

```bash
git clone https://github.com/yourusername/gaiascript.git
cd gaiascript
cargo build --release
```

### Usage

#### Run a GaiaScript program
```bash
cargo run -- run examples/cnn.gaia
```

#### Parse and print the AST
```bash
cargo run -- parse examples/transformer.gaia
```

#### Compile to JavaScript
```bash
cargo run -- compile examples/morph_game.gaia
```

#### Start the web server
```bash
cargo run -- serve
```
Then open http://localhost:8080/gaia-playground.html in your browser.

### Web Visualization

The web playground allows you to:
1. Write GaiaScript code directly in the browser
2. Visualize neural network architectures in 3D
3. Compile GaiaScript to JavaScript
4. Run a simplified version of the MorphSphere game

## Language Reference

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for the full language specification.

## Web Server

The `serve` command starts a simple web server that provides:
- The GaiaScript playground UI
- API endpoints for compiling and running GaiaScript
- Static file hosting for the web interface

## License

MIT

## Acknowledgments

This project demonstrates the concept of an AI-optimized programming language that prioritizes computational efficiency and information density for AI-to-AI communication, with visual demonstrations of the concepts through the MorphSphere game.