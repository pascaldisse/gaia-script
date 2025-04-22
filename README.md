# GaiaScript: AI-Optimized Programming Language (AOPL)

GaiaScript is an implementation of AOPL, a symbolic programming language designed for AI-to-AI communication with minimal token usage and maximum information density.

## Features

- **Ultra-compact symbolic syntax** for defining neural network architectures
- **Pipeline-oriented syntax** for data flow operations
- **Context-aware grammar** where operators derive meaning from position and context
- **Specialized for AI workloads** with built-in tensor operations and ML concepts

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

## Getting Started

### Prerequisites

- Rust (latest stable version)

### Installation

```bash
git clone https://github.com/yourusername/gaiascript.git
cd gaiascript
cargo build --release
```

### Usage

Run a GaiaScript program:
```bash
cargo run -- run examples/cnn.gaia
```

Parse and print the AST:
```bash
cargo run -- parse examples/transformer.gaia
```

## Language Reference

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for the full language specification.

## License

MIT

## Acknowledgments

This project demonstrates the concept of an AI-optimized programming language that prioritizes computational efficiency and information density for AI-to-AI communication.