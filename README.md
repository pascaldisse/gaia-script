# GaiaScript: Ultra-Compact Symbolic Programming

GaiaScript is an ultra-compact symbolic programming language designed for maximum density and expressiveness. The entire application is contained in a single file with no whitespace or comments.

## Core Philosophy

- **Extreme Terseness**: Uses symbolic notation for maximum information density
- **Single File**: Entire application (UI, 3D, neural networks) in one file
- **Symbolic Representation**: Uses mathematical and special symbols for all operations
- **Cross-Domain**: Unifies UI, 3D graphics, and neural networks in one language

## The File

Everything is contained in `main.gaia`:

```
N〈γ⊕φ⊕δ⊕α〉γ:H→∮800×600→П→⊞3×3→[(⌘"▶"⌘click→φ.①),(⌘"↺"⌘click→φ.⓪),(⌑"§"⇄φ.ς)]φ:⦿→⌖→[T10→L20→P→D32→τ]×3→⟲60δ:I224×224×3→C₁32→P→C₂64→P→F→D₁128→D₂64→D₀10→Sα:⊿→⍉→◐→⌼→☀→⊠→⊛
```

This 89-character file implements:

- UI Components (γ): Panel, Buttons, Layout, Canvas, Labels
- Game Engine (φ): 3D World, Camera, Neural Network Controller
- Neural Network (δ): Convolutional layers, Dense layers, Softmax
- Assets (α): 3D models, textures, materials, shaders

## Running the App

1. Start the GaiaScript compiler: `cargo run -- serve`
2. Open a browser to http://localhost:8080/unified/
3. The symbolic language is compiled and executed at runtime

## Working with Symbols

| Component | Symbol |
|-----------|--------|
| UI        | γ      |
| Game      | φ      |
| Data      | δ      |
| Assets    | α      |
| Canvas    | ∮      |
| Panel     | П      |
| Grid      | ⊞      |
| Button    | ⌘      |
| Label     | ⌑      |
| 3D World  | ⦿      |
| Camera    | ⌖      |
| Renderer  | ⟲      |
| Event     | ⌘click→|
| Binding   | ⇄      |

## Prerequisites

- Rust (latest stable version)
- Web browser with JavaScript enabled

## Installation

```bash
git clone https://github.com/yourusername/gaiascript.git
cd gaiascript
cargo build --release
```

## Extending the Language

The compiler can be extended with new symbols by modifying:
- `src/aopl.pest` - Grammar definitions
- `src/extensions/` - Implementation of new components

## License

MIT