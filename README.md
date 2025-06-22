# GaiaScript: Universal Symbolic Language

> **🌏 GaiaScript (地本) is written entirely in Chinese characters, Greek letters, and mathematical symbols - NO English keywords!**

## Overview
GaiaScript is an ultra-compact symbolic language designed for minimal token usage in AI-to-AI communication. It uses Chinese characters (kanji/hanzi), Unicode mathematical symbols, Greek letters, and emojis to represent complex operations, neural network architectures, and programming constructs efficiently. The language is platform-agnostic, with a universal compiler targeting multiple platforms.

**Core Design**: The entire language uses symbolic notation - no English keywords or traditional syntax.

**Current Version**: v0.1.0 (June 2025)
**Primary Target**: Web (JavaScript)
**Build Status**: ✅ Working

## Project Structure
- **docs/**: Documentation and examples
  - `web/`: Web interface and runtime files
  - `gaiascript_reference.md`: Complete language reference
- **comp/**: Universal compiler (Rust implementation)
  - `Cargo.toml`: Rust project configuration
  - `src/`: Compiler source code
  - `target/`: Compilation artifacts
- **build/**: Build artifacts
  - `gaia-compiled.js`: Compiled JavaScript output
- **test/**: Testing environment
- **ext/**: Extension system for encoding
- **main.gaia**: Main GaiaScript application
- **restart.sh**: Build and deployment script

## Features
- **Universal Compiler**: Written in Rust, currently targets JavaScript/Web
- **Compact Representation**: Expresses complex ideas with minimal tokens (~40% reduction)
- **Native ML Support**: Built-in neural networks, transformers, GANs
- **Component-based Design**: Reusable symbolic components
- **Web Interface**: Interactive playground and applications
- **Translation System**: Convert between GaiaScript, natural languages, and programming languages
- **Base64 Number Encoding**: Efficient number representation system
- **Extension System**: Dynamically loadable encoding extensions

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pascaldisse/gaia-script.git
   cd gaia-script/.gaia
   ```

2. **Build and run**:
   ```bash
   ./restart.sh
   ```
   This will:
   - Compile main.gaia to JavaScript
   - Start a web server on port 8081
   - Open the application in your browser

3. **Access the web interface**:
   - Main App: http://localhost:8081/main-app.html
   - Chat App: http://localhost:8081/gaia-app.html
   - Playground: http://localhost:8081/gaia-playground.html

## Real GaiaScript Example
Here's actual GaiaScript code from `main.gaia`:

```gaiascript
N〈υ⊕η⊕Γ⊕μ⊕∂⊕ℝ〉
⊛⟪ℝ⟫ℝΘ⊛⟪/ℝ⟫
ℝ〈Þ⊕¢⊕Ħ〉
Þ:{⊹:0,⊿:1,⋮:2,⋰:3,⋱:4,⌓:5,⌗:6,⊥:7,⊢:8,⊧:9}
γ:⟨{ϖ,ϖł,ϱ}⟩→∮⌗≡×⊧≡→П→⊞⋰×⋰→[(⌘"▶"⌘ω→φ.①),(⌘"↺"⌘ω→φ.⓪)]
δ:⟨{ϖ:⟨ℵ:⊹⟩,ϖł:⟨ϕ:⟨ρ:⋮⊹ξ,λ:ς,δ:φ,φΔ:ϕ⟩⟩}⟩
Ñ:I⋮≡×⋮≡×⋰→C₁⋰⋮→P→C₂⊧⋱→P→F→D₁⊿⋮⌗→D₂⊧⋱→D₀⊿⊹→S
```

As you can see, GaiaScript uses:
- **Greek letters**: υ, η, Γ, μ, ∂, ℝ, Θ, ω, φ, ρ, λ, ς, δ, ξ
- **Mathematical symbols**: ⊕, ⟪⟫, ⊛, ∮, ≡, ⊞, →, ⇄
- **Special Unicode**: ⌘ (command), ⌑ (label), П (panel), ⌗ (hash)
- **Chinese/Japanese influence**: Structure inspired by ideographic languages
- **Numbers**: ⊹=0, ⊿=1, ⋮=2, ⋰=3, ⋱=4, ⌓=5, ⌗=6, ⊥=7, ⊢=8, ⊧=9

## Encoding System
The encoding system uses multiple approaches:

### 1. Chinese Characters (Kanji/Hanzi)
- **地本** (dì běn) - GaiaScript ("Earth Script")
- **鉤本** (gōu běn) - JavaScript ("Hook Script") 
- **蛇本** (shé běn) - Python ("Snake Script")
- **原子** (yuán zǐ) - React ("Atom/Atomic")
- **脚本** (jiǎo běn) - Script/Code
- **函数** (hán shù) - Function
- **変数** (biàn shù) - Variable

### 2. Greek Letters for Components
- **υ** (upsilon) - UI components
- **η** (eta) - Neural networks  
- **Γ** (gamma) - Game systems
- **μ** (mu) - Transformations
- **∂** (partial) - Differential operations
- **ℝ** (real) - Number systems
- **Θ** (theta) - State/configuration
- **Ω** (omega) - Termination/completion

### 3. Mathematical & Unicode Symbols
- **⊕** - Concatenation/composition
- **→** - Flow/transformation
- **⟨⟩** - Grouping/containers
- **⟪⟫** - Metadata blocks
- **∮** - Canvas/circular integration
- **П** - Panel/UI container
- **⊞** - Grid layout
- **⌘** - Button/command
- **⌑** - Label/text display

## GaiaScript Symbolic Notation
For machine learning operations, GaiaScript uses a compact symbolic notation:

- `N` - Neural Network
- `I` - Input layer
- `D₁` - Dense layer with ReLU activation
- `D₀` - Dense layer with Softmax activation
- `C₁` - Convolutional layer with ReLU activation
- `P` - Pooling layer
- `F` - Flatten layer
- `ρ` - ReLU activation
- `σ` - Sigmoid activation
- `τ` - Tanh activation
- `→` - Connection between layers
- `⊕` - Network composition
- `〈...〉` - Group notation

### 4. Word & Phrase Encoding System
The system encodes common words and phrases with compact codes:
- **w₀** = "the", **w₁** = "of", **w₂** = "and", **w₃** = "to"
- **w₂₅** = "code", **w₃₁** = "system", **w₄₁** = "network"
- **s₀** = "The system is running"
- **s₂₅** = "ALWAYS USE GAIASCRIPT"

This allows expressions like:
- `w₀ w₃₁ w₁ w₂₅` = "the system of code"
- `s₂₆` = "Compiler Location: The GaiaScript compiler is located at..."

## Ultra-Compact Encoding
The system includes an even more compact encoding for certain elements:

- Text: `T⟨...⟩` - Text values
- Lists: `L⟨...⟩` - List of items
- Objects: `O⟨...⟩` - Key-value object
- Functions: `F⟨...⟩⟨...⟨/F⟩` - Function definition
- Components: `C⟨...⟩⟨...⟨/C⟩` - Component definition
- UI: `UI⟨✱⟩...⟨/UI⟩` - Main UI application
- Styles: `□{...}⟦...⟧` - Styled UI elements

## More Examples

### UI Counter Component
```gaiascript
δ:⟨{
  ϖ:⟨ℵ:⊹⟩,  // state: count = 0
  ϱ:⟨
    П→⊞⋰×⊿→[  // Panel → Grid 3×1
      (⌘"−"⌘ω→ℵ⊝),      // Button "-" click → count--
      (⌑"ℵ:${ℵ}"⇄ℵ),    // Label bound to count
      (⌘"⊿"⌘ω→ℵ⊕)       // Button "+" click → count++
    ]
  ⟩
}⟩
```

### Neural Network (CNN)
```gaiascript
Ñ:I⋮≡×⋮≡×⋰→C₁⋰⋮→P→C₂⊧⋱→P→F→D₁⊿⋮⌗→D₂⊧⋱→D₀⊿⊹→S
// Input 224×224×3 → Conv 32 → Pool → Conv 64 → Pool → 
// Flatten → Dense 128 → Dense 64 → Dense 10 → Softmax
```

A GAN architecture:
```
N〈G⊕D〉
G:Z🔢100→U4×4×512→[U2×→C3×3ρ]×2→C3τ
D:I→[C64×3ρ→P2]×3→F→D₁🔢512ρ→D₀✅1σ
L:G(Z)⊳D⟿BCE+λ‖∇D‖
```

## Translation System

The GaiaScript Translator can convert between:

- Natural language (自然) ↔ GaiaScript (地本)
- JavaScript (鉤本) ↔ GaiaScript (地本)  
- Python (蛇本) ↔ GaiaScript (地本)
- GaiaScript (地本) → React (原子)

### Command-Line Usage

```bash
translate [options] <text>
```

Options include:
- `-f, --from <language>` - Source language (auto, natural, gaiascript, javascript, python)
- `-t, --to <language>` - Target language (gaiascript, natural, javascript, python, react)

Examples:
```bash
# Translate from natural language to GaiaScript
translate "Create a neural network with 2 layers"

# Translate from JavaScript to GaiaScript
translate -f javascript "const model = tf.sequential();"

# Translate from GaiaScript to Python
translate -f gaiascript -t python "N I → D₁ 128 ρ → D₀ 10 → S"
```

## Getting Started

### Command-Line Interface
```bash
# Compile
./gaia run main.gaia

# Compile for web
./gaia build main.gaia --target=web

# Run tests
cd test
node run.js test --file=examples/basic-tests.gaia

# Use translator
./translate "Create a function that returns the sum of two numbers"
```

## Supported Platforms
- Web (JavaScript/HTML)
- macOS (Swift/AppKit)
- Windows (C#/.NET)
- Linux (C/GTK+)
- iOS (Swift/UIKit)
- Android (Kotlin)

## Tools
- **Playground**: Interactive code editor
- **Translator**: Converts between GaiaScript, natural language, and other languages
- **Compiler**: Cross-platform code generation
- **Package Format**: .gaia for compact distribution
- **Encoding Tools**: Utilities for encoding/decoding text

## Documentation
See docs/ for detailed syntax and examples, or use:
```bash
./gaia playground
./gaia translator
```