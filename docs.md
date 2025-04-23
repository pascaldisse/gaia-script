# GaiaScript Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Language Reference](#language-reference)
3. [Neural Network Support](#neural-network-support)
4. [UI Components](#ui-components)
5. [3D Components](#3d-components)
6. [Extended GaiaScript Syntax](#extended-gaiascript-syntax)
7. [Symbolic Notation](#symbolic-notation)
8. [LynxJS Compiler](#lynxjs-compiler)
9. [LLVM Compiler](#llvm-compiler)
10. [API Reference](#api-reference)
11. [Examples](#examples)
12. [Implementation Architecture](#implementation-architecture)

## Introduction

GaiaScript is an ultra-compact symbolic programming language designed for maximum density and expressiveness. It allows defining complex applications including neural networks, UI components, and 3D rendering in a single file using specialized symbols and notations.

### Core Philosophy

- **Extreme Terseness**: Uses symbolic notation for maximum information density
- **Single File**: Entire application structure fits in one compact file
- **Symbolic Representation**: Uses mathematical and special symbols for operations
- **Cross-Domain**: Unifies UI, 3D graphics, and neural networks

## Language Reference

GaiaScript programs begin with a network declaration (`N`) and can contain various components such as neural network layers, UI elements, 3D objects, and event handlers. The language uses a pipeline-oriented syntax where data flows through operations using arrow notation (`→` or `->`).

### Basic Syntax

```
N〈γ⊕φ⊕δ⊕α〉γ:H→∮800×600→П→⊞3×3→[(⌘"▶"⌘click→φ.①),(⌘"↺"⌘click→φ.⓪),(⌑"§"⇄φ.ς)]
```

### Components and Symbols

#### Networks
- `N`: Network declaration
- `〈...〉`: Network components grouping
- `⊕`: Component composition
- `:`: Component definition

#### Input Types
- `T`: Text input
- `I`: Image input 
- `S`: Sequence input
- `Z`: Latent/random vector input

#### Neural Network Layers
- `C₁`, `C₂`: Convolutional layers (subscripts indicate layer number)
- `D₁`, `D₀`: Dense layers (1 for hidden, 0 for output)
- `P`: Pooling operation
- `F`: Flatten operation
- `U`: Upsampling
- `L`: LSTM layer
- `H`: Attention heads
- `R`: Reshape operation
- `A`: Attention mechanism

#### Activation Functions
- `ρ`: ReLU activation
- `σ`: Sigmoid activation
- `τ`: Tanh activation
- `S`: Softmax activation

#### Flow Control
- `→` or `->`: Data flow
- `⊳`: Feed output
- `⟿`: Loss function
- `[...]`: Block grouping
- `×n`: Repetition (repeat n times)

## Neural Network Support

GaiaScript was originally designed to express complex neural network architectures with minimal tokens. It supports a variety of network architectures:

### CNN Example
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

## UI Components

GaiaScript provides symbolic notation for UI components, making it easy to define interfaces alongside neural networks.

- `∮`: Canvas (with optional dimensions like `800×600`)
- `П`: Panel
- `⊞`: Layout (with optional dimensions)
- `⌘`: Button (with optional label)
- `⌑`: Label (with optional text)

## 3D Components

For 3D applications and games, GaiaScript includes symbols for 3D rendering:

- `⦿`: 3D World
- `⌖`: Camera
- `⟲`: Renderer 
- `☀`: Light
- `⊿`: Mesh/3D model
- `⍉`: Texture
- `◐`: Material
- `⌼`: Shader
- `⊛`: Scene
- `⊠`: Skybox

### Events and Bindings
- `⌘click→`: Click event handler
- `⇄`: Data binding

## Extended GaiaScript Syntax

GaiaScript can be extended for general conversation with the following syntax:

### Query Types
- `Q⟨...⟩`: Question
- `R⟨...⟩`: Request/command
- `D⟨...⟩`: Definition/declaration

### Data Types
- `T⟨...⟩`: Text/string
- `N⟨...⟩`: Number
- `B⟨...⟩`: Boolean
- `L⟨...⟩`: List
- `O⟨...⟩`: Object/map

### Operations
- `⊕`: Concatenation/addition
- `⊗`: Transformation/processing
- `→`: Data flow/sequence
- `λ`: Function/operation
- `∀`: Universal quantifier (for all)
- `∃`: Existential quantifier (there exists)
- `∈`: Membership
- `⊆`: Subset
- `⊂`: Proper subset

### Control Structures
- `[...]×n`: Repeat n times
- `(...)|...`: Condition
- `{...}`: Block/grouping

### Special Symbols
- `ε`: Empty/null
- `Ω`: Complete/terminate
- `δ`: Difference/change
- `Σ`: Sum/collection
- `μ`: Mean/average
- `σ`: Standard deviation/variation
- `∇`: Gradient/direction
- `∫`: Integration/combination
- `ℱ`: Format/structure

## Symbolic Notation

GaiaScript's power comes from its symbolic notation. Here's a reference table for the extended symbols:

| Symbol | Meaning | Usage |
|--------|---------|-------|
| `Q⟨...⟩` | Question | Query requiring information |
| `R⟨...⟩` | Request | Command to perform an action |
| `D⟨...⟩` | Definition | Declaration of information |
| `T⟨...⟩` | Text | Natural language text |
| `N⟨...⟩` | Number | Numeric value |
| `B⟨...⟩` | Boolean | True/false (1/0) |
| `L⟨...⟩` | List | Ordered collection |
| `O⟨...⟩` | Object | Key-value collection |
| `⊕` | Concatenation | Join elements |
| `⊗` | Transformation | Process input |
| `→` | Data Flow | Sequential operations |
| `λ` | Function | Operation or procedure |
| `∀` | Universal | "For all" quantifier |
| `∃` | Existential | "There exists" quantifier |
| `∈` | Membership | Element in set |
| `⊆` | Subset | Containment relation |
| `⊂` | Proper Subset | Strict containment |
| `[...]×n` | Repetition | Repeat n times |
| `(...)\|...` | Condition | Conditional expression |
| `{...}` | Block | Grouping of operations |
| `ε` | Empty | Null value |
| `Ω` | Complete | Termination |
| `δ` | Difference | Change value |
| `Σ` | Sum | Collection/summation |
| `μ` | Mean | Average |
| `σ` | Standard Deviation | Variation |
| `∇` | Gradient | Direction vector |
| `∫` | Integration | Combination |
| `ℱ` | Format | Structure specification |

## LynxJS Compiler

GaiaScript can compile to LynxJS, a cross-platform framework developed by ByteDance for building native user interfaces across multiple platforms.

### LynxJS Features

- **Multi-Threading**: LynxJS supports multi-threading with directives like "background-only" to offload tasks
- **CSS Support**: Styling with familiar CSS syntax, either external or inline
- **Component Architecture**: React-like component system with extensions
- **Native Performance**: Rust-powered optimizations for fast execution

### LynxJS Component Example

```typescript
import { Component } from '@lynx-ui/react';

export default class App extends Component {
  render() {
    return (
      <view>
        <text>Hello, Lynx!</text>
      </view>
    );
  }
}
```

### Conditional Code for Cross-Platform

```typescript
const isLynx = typeof window === 'undefined';
return isLynx ? (
  <view>
    <text>Lynx Environment</text>
  </view>
) : (
  <main>
    <h1>Web Environment</h1>
  </main>
);
```

## LLVM Compiler

GaiaScript can also compile to native machine code using LLVM, targeting platforms like ARM64 macOS (Apple M1).

### LLVM Pipeline

1. GaiaScript source → Parser → AST
2. AST → LLVM IR generator
3. LLVM IR → Optimization passes
4. Optimized IR → Machine code for target architecture

### Key LLVM Components

- **Target Triple**: Specifies architecture, vendor, and OS (e.g., `aarch64-apple-darwin` for ARM64 macOS)
- **IR Generation**: Converts GaiaScript constructs to LLVM instructions
- **Optimization**: Standard LLVM passes for performance improvements
- **Machine Code**: Native executable generation

### Implementation Tools

- **Inkwell**: Rust wrapper for LLVM APIs, providing a safer interface
- **Target Machine**: Configuration for specific architectures like ARM64

## API Reference

The GaiaScript API provides programmatic access to various capabilities through a RESTful interface.

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
Authorization: Bearer YOUR_API_KEY
```

### Key Endpoints

- **GET /llm/health**: Check API health
- **GET /llm/models**: List available LLM models
- **POST /llm/completion**: Generate text completion
- **POST /llm/chat**: Generate chat response
- **POST /llm/stream**: Stream chat response
- **GET /personas**: Get all personas
- **POST /personas/:id/chat**: Chat with a specific persona

### Example Request (Chat)
```json
{
  "model": "meta-llama/Meta-Llama-3-70B-Instruct",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"},
    {"role": "assistant", "content": "I'm doing well, thank you!"},
    {"role": "user", "content": "Explain quantum computing briefly"}
  ],
  "temperature": 0.7
}
```

## Examples

### MorphSphere Game

```
N〈G⊕W⊕M〉
G: I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 7 → S
W: Z 512 → U 16×16×32 → C₁ 64 3 ρ → U 2× → C₂ 32 3 ρ → R
M: Z 256 → D₁ 64 ρ → D₂ 128 ρ → R 4×4×8 → U 2× → C₁ 16 3 ρ → U 2× → C₀ 3 τ
E: G⊳W⊳M⟿BCE+λ‖∇‖
P: M → [A 8 H → D₁ 32 ρ]×4 → F → D₀ 16 → S
```

### Extended GaiaScript Examples

#### Basic Questions
```
Q⟨T⟨What is machine learning?⟩⟩
```

#### Code Generation
```
R⟨λ⟨Python⟩⊗T⟨Sort a list of integers.⟩⟩
```

#### Text Processing
```
R⟨T⟨Summarize the main points of quantum computing.⟩⊗ℱ⟨Bullet points⟩⟩
```

## Implementation Architecture

GaiaScript is implemented in Rust with these key components:

1. **Parser (src/parser.rs)**: Uses Pest parser generator with grammar defined in aopl.pest
2. **AST (src/ast.rs)**: Defines the Abstract Syntax Tree nodes for the language
3. **Interpreter (src/interpreter.rs)**: Executes GaiaScript code
4. **Compilers**: Multiple target compilers are available:
   - LynxJS Compiler (src/compilers/lynx_compiler.rs)
   - React Compiler (src/compilers/react_compiler.rs)
   - Flutter Compiler (src/compilers/flutter_compiler.rs)
   - Kotlin Compiler (src/compilers/kotlin_compiler.rs)
   - LLVM Compiler (src/compilers/llvm_compiler.rs)

### Running GaiaScript

1. Build the project: `cargo build`
2. Run a GaiaScript program: `cargo run -- run examples/cnn.gaia`
3. Parse and print AST: `cargo run -- parse examples/cnn.gaia` 
4. Start web server (for MorphSphere game): `cargo run -- serve`
5. Compile to LynxJS: `cargo run -- target examples/minimal.gaia lynx`
6. Compile to native code (LLVM): `cargo run -- llvm examples/minimal.gaia output_name`

### Extension Points

You can extend GaiaScript by:
1. Adding new symbols to the grammar in `src/aopl.pest`
2. Implementing new AST nodes in `src/ast.rs`
3. Supporting new operations in `src/interpreter.rs`
4. Adding code generation in the compiler modules