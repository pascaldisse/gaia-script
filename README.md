# GaiaScript: Universal Symbolic Language

## Overview
GaiaScript is an ultra-compact symbolic language designed for minimal token usage in AI-to-AI communication. It uses Unicode symbols, kanji, and emojis to represent complex operations, neural network architectures, and programming constructs efficiently. The language is platform-agnostic, with a universal compiler targeting multiple platforms.

## Project Structure
- **docs/**: Documentation and examples
- **comp/**: Universal compiler (Rust/JS)
- **build/**: Build artifacts
- **test/**: Testing environment
- **gaia-translator/**: Translation tools between GaiaScript and other languages

## Features
- **Universal Compiler**: Targets JavaScript, WebAssembly, macOS, Windows, Linux, iOS, Android
- **Compact Representation**: Expresses complex ideas with minimal tokens
- **Native ML Support**: Built-in neural networks, transformers, GANs
- **Component-based Design**: Reusable symbolic components
- **Interactive Tools**: Playground and translator interfaces
- **Translation System**: Convert between GaiaScript, natural languages, and programming languages

## Encoding Table
The encoding table (encoding_table.csv) defines the language's symbols:

- **Data Types**: 📝 (Text), 🔢 (Number), ✅ (Boolean), 📋 (List), 📦 (Object)
- **Operations**: ⊕ (Concatenation), → (Flow), ⊗ (Transform), λ (Function)
- **Cultural Concepts**: 木 (Tree), 山 (Mountain), 川 (River), 人 (Person), 愛 (Love)
- **Emotions**: 😀 (Happy), 😢 (Sad), 😡 (Angry)
- **Actions**: 💡 (Idea), 🔍 (Search), 💾 (Save)
- **Programming**: r0 (fn), c0 (class), f0 (Widget), re0 (Component)
- **English**: w0 (the), w1 (be)
- **Programming Languages**: 地本 (GaiaScript), 鉤本 (JavaScript), 蛇本 (Python), 原子 (React)

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

## Ultra-Compact Encoding
The system includes an even more compact encoding for certain elements:

- Text: `T⟨...⟩` - Text values
- Lists: `L⟨...⟩` - List of items
- Objects: `O⟨...⟩` - Key-value object
- Functions: `F⟨...⟩⟨...⟨/F⟩` - Function definition
- Components: `C⟨...⟩⟨...⟨/C⟩` - Component definition
- UI: `UI⟨✱⟩...⟨/UI⟩` - Main UI application
- Styles: `□{...}⟦...⟧` - Styled UI elements

## Example
A convolutional neural network in GaiaScript:
```
N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S
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