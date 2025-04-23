# GaiaScript: Comprehensive Reference

## Introduction

GaiaScript is an ultra-compact symbolic programming language designed for maximum density and expressiveness. It allows defining complex applications including neural networks, UI components, and 3D rendering in a single file using specialized symbols and notations.

## Core Philosophy

- **Extreme Terseness**: Uses symbolic notation for maximum information density
- **Single File**: Entire application structure fits in one compact file
- **Symbolic Representation**: Uses mathematical and special symbols for operations
- **Cross-Domain**: Unifies UI, 3D graphics, and neural networks

## Language Structure

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

#### UI Components
- `∮`: Canvas (with optional dimensions like `800×600`)
- `П`: Panel
- `⊞`: Layout (with optional dimensions)
- `⌘`: Button (with optional label)
- `⌑`: Label (with optional text)

#### 3D Components
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

#### Flow Control
- `→` or `->`: Data flow
- `⊳`: Feed output
- `⟿`: Loss function
- `[...]`: Block grouping
- `×n`: Repetition (repeat n times)

#### Events and Bindings
- `⌘click→`: Click event handler
- `⇄`: Data binding

## Implementation Components

GaiaScript is implemented in Rust with these key components:

1. **Parser (src/parser.rs)**: Uses Pest parser generator with grammar defined in aopl.pest
2. **AST (src/ast.rs)**: Defines the Abstract Syntax Tree nodes for the language
3. **Interpreter (src/interpreter.rs)**: Executes GaiaScript code
4. **Compilers**: Multiple target compilers are available:
   - LynxJS Compiler (src/compilers/lynx_compiler.rs)
   - React Compiler (src/compilers/react_compiler.rs)
   - Flutter Compiler (src/compilers/flutter_compiler.rs)
   - Kotlin Compiler (src/compilers/kotlin_compiler.rs)

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

### MorphSphere Game
```
N〈G⊕W⊕M〉
G: I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 7 → S
W: Z 512 → U 16×16×32 → C₁ 64 3 ρ → U 2× → C₂ 32 3 ρ → R
M: Z 256 → D₁ 64 ρ → D₂ 128 ρ → R 4×4×8 → U 2× → C₁ 16 3 ρ → U 2× → C₀ 3 τ
E: G⊳W⊳M⟿BCE+λ‖∇‖
P: M → [A 8 H → D₁ 32 ρ]×4 → F → D₀ 16 → S
```

## Running GaiaScript

1. Build the project: `cargo build`
2. Run a GaiaScript program: `cargo run -- run examples/cnn.gaia`
3. Parse and print AST: `cargo run -- parse examples/cnn.gaia` 
4. Start web server (for MorphSphere game): `cargo run -- serve`
5. Access the web interface at: http://localhost:8080/unified/

## Extension Points

You can extend GaiaScript by:
1. Adding new symbols to the grammar in `src/aopl.pest`
2. Implementing new AST nodes in `src/ast.rs`
3. Supporting new operations in `src/interpreter.rs`
4. Adding code generation in the compiler modules

## Implementation Status

GaiaScript is currently functional with support for:
- Basic neural network architectures (CNNs, RNNs, GANs)
- UI component representation
- 3D rendering and game mechanics
- Multiple compilation targets

Future work includes:
- More complete tensor operations
- Optimization for performance
- Additional export formats
- Better error reporting

## Conclusion

GaiaScript represents a unique approach to programming language design with a focus on extreme compactness and symbolic representation. It excels at defining complex systems like neural networks and 3D applications with minimal syntax while maintaining expressiveness.