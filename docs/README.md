# GaiaScript: An Ultra-Compact Symbolic Language

GaiaScript is a symbolic language designed for minimal token usage in AI-to-AI communication. It uses a rich set of Unicode symbols to represent complex operations and data structures in a highly compact form.

## Overview

GaiaScript was created to enable efficient communication between AI systems by minimizing token usage while maximizing semantic content. The language uses Unicode symbols extensively to compress common patterns and operations.

Key features:
- Ultra-compact symbolic notation
- Neural network architecture description
- Component-based design
- Multi-platform compilation targets
- Interactive UI capabilities
- Testing and evolutionary optimization

## Getting Started

### Installation

1. Clone the repository:
```
git clone https://github.com/pascaldisse/gaia-script.git
cd gaia-script/.gaia
```

2. Ensure dependencies:
   - Rust toolchain (for compiler)
   - Node.js (for runtime)
   - Python 3 (for web server)

### Running a GaiaScript Program

The easiest way to run GaiaScript:

```bash
./restart.sh
```

This will:
- Compile main.gaia using the Rust compiler
- Start a web server on port 8081
- Open the application in your browser

### Manual compilation:

```bash
# Using the Rust compiler directly
cd comp && cargo build --release
./target/release/gaia-universal-compiler ../main.gaia --output=../build/output.js
```

### Writing GaiaScript

GaiaScript files use the `.gaia` extension. Here's a simple example:

```
N〈υ⊕η⊕Γ〉
υ:⟨{ϖ,ϖł,ϱ}⟩→∮⌗≡×⊧≡→П→⊞⋰×⋰→[(⌘"▶"⌘ω→φ.①),(⌘"↺"⌘ω→φ.⓪)]
η:I⋮≡×⋮≡×⋰→C₁⋰⋮→P→C₂⊧⋱→P→F→D₁⊿⋮⌗→D₂⊧⋱→D₀⊿⊹→S
Γ〈G⊕D⊕L〉
G:Z⊿≡→U⋱×⋱×⌓⊿⋮→[U⋮×→C⋮⌓⊧ρ]×⋮→C⋰τ
D:I→[C⊧⋱⌓ρ→P⋮]×⋰→F→D₁⊿⊹⋮⋱ρ→D₀⊿σ
L:G(Z)⊳D⟿BCE+λ‖∇D‖
```

This small example defines a network with UI components, a neural network, and a GAN architecture.

## Core Syntax

GaiaScript uses several categories of symbols:

1. **Network definition**: `N〈components〉`
2. **Component definition**: `ComponentName:implementation`
3. **Neural network layers**: `C₁`, `D₀`, etc.
4. **Operations**: `→`, `⊕`, `⊳`, `⟿`, etc.
5. **Data types**: Text `T⟨...⟩`, Numbers `N⟨...⟩`, etc.
6. **Special encodings**: Word mappings `w₁`, `w₂`, etc.

## Components

Components are the building blocks of GaiaScript programs:

- **υ (Upsilon)**: UI components
- **η (Eta)**: Neural networks
- **Γ (Gamma)**: Generative models
- **μ (Mu)**: Transformations
- **∂ (Partial)**: Differential operations
- **ℝ (Real)**: Number system

## Compilation Targets

Current compiler targets:
- **JavaScript (web)** - Primary target, fully implemented
- **WebAssembly** - Planned
- **Native code** - Planned via LLVM
- **Mobile platforms** - Planned (Flutter/React Native)

The universal compiler is written in Rust and located in the `comp/` directory.

## Testing and Optimization

GaiaScript includes tools for:

- Test-driven development
- Evolutionary optimization
- UI testing
- Performance metrics

## Advanced Features

- **Symbol compression**: Using word mappings (w₀-w₅₀)
- **Neural networks**: Compact description of architectures
- **Generative models**: GANs and other generative architectures
- **UI components**: Interactive elements with minimal description

## Examples

See the `docs/examples/` directory for example GaiaScript programs.

For interactive examples, visit:
- http://localhost:8081/main-app.html - Main application
- http://localhost:8081/gaia-app.html - Chat application
- http://localhost:8081/gaia-playground.html - Interactive playground

## Documentation

- `gaiascript_reference.md` - Complete language reference
- `token_efficiency.md` - Token usage optimization guide
- `macos_compiler.md` - Compiler documentation
- `test-environment.md` - Testing guide
- `ai_agent_prompt.md` - AI integration guide

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.