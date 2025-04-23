# GaiaScript Language Reference

GaiaScript is an ultra-compact symbolic language designed for token-efficient AI-to-AI communication. This reference provides the complete syntax and semantics of GaiaScript.

## 1. Basic Syntax

### 1.1 Structure Elements

| Symbol | Name | Description | Example |
|--------|------|-------------|---------|
| `⟨...⟩` | Brackets | Define scope/container | `N⟨υ⊕η⊕μ⟩` |
| `⟪...⟫` | Metadata | Define metadata/attributes | `⊛⟪η⟫ηΚ⊛⟪/η⟫` |
| `:` | Definition | Assign definition | `G: I → C₁ 32 ρ → S` |
| `;` | Separator | Separate statements | `x:⋰; y:⊢` |
| `.` | Accessor | Access property | `obj.value` |
| `⊕` | Concatenation | Join elements | `⟨υ⊕η⊕Γ⊕μ⟩` |

### 1.2 Data Types

| Symbol | Name | Example |
|--------|------|---------|
| `T⟨...⟩` | Text | `T⟨Hello world⟩` |
| `N⟨...⟩` | Number | `N⟨⋮⌓⟩` (25) |
| `B⟨...⟩` | Boolean | `B⟨1⟩` (true), `B⟨0⟩` (false) |
| `L⟨...⟩` | List | `L⟨a,b,c⟩` |
| `O⟨...⟩` | Object | `O⟨x:⋮,y:⋰⟩` |
| `λ⟨...⟩` | Function | `λ⟨x⟩⟨x²⟩` |

### 1.3 Query Types

| Symbol | Name | Usage |
|--------|------|-------|
| `Q⟨...⟩` | Question | `Q⟨T⟨w₀ capital w₂ France?⟩⟩` |
| `R⟨...⟩` | Request | `R⟨λ⟨sort⟩⟨L⟨3,1,2⟩⟩⟩` |
| `D⟨...⟩` | Definition | `D⟨O⟨name:Alice,age:⋮⌓⟩⟩` |

## 2. Operators

### 2.1 Mathematical Operators

| Symbol | Operation | Example |
|--------|-----------|---------|
| `+` | Addition | `⋮+⋰` (2+3) |
| `-` | Subtraction | `⌓-⋮` (5-2) |
| `×` | Multiplication | `⋰×⋱` (3×4) |
| `÷` | Division | `⊢÷⋮` (8÷2) |
| `^` | Exponentiation | `⋮^⋰` (2^3) |
| `√` | Square root | `√⋱⌗` (√16) |
| `∑` | Summation | `∑L⟨⋮,⋰,⋱⟩` (2+3+4) |
| `∏` | Product | `∏L⟨⋮,⋰,⋱⟩` (2×3×4) |

### 2.2 Logical Operators

| Symbol | Operation | Example |
|--------|-----------|---------|
| `∧` | AND | `B⟨1⟩∧B⟨1⟩` |
| `∨` | OR | `B⟨0⟩∨B⟨1⟩` |
| `¬` | NOT | `¬B⟨0⟩` |
| `⊻` | XOR | `B⟨1⟩⊻B⟨1⟩` |
| `→` | Implication | `A→B` |
| `↔` | Equivalence | `A↔B` |

### 2.3 Collection Operators

| Symbol | Operation | Example |
|--------|-----------|---------|
| `∈` | Element of | `x∈L⟨a,b,c⟩` |
| `∉` | Not element of | `d∉L⟨a,b,c⟩` |
| `⊂` | Proper subset | `L⟨a,b⟩⊂L⟨a,b,c⟩` |
| `⊆` | Subset | `L⟨a,b⟩⊆L⟨a,b⟩` |
| `∪` | Union | `L⟨a,b⟩∪L⟨b,c⟩` |
| `∩` | Intersection | `L⟨a,b⟩∩L⟨b,c⟩` |
| `∖` | Set difference | `L⟨a,b,c⟩∖L⟨b⟩` |

## 3. Control Flow

### 3.1 Flow Operators

| Symbol | Operation | Example |
|--------|-----------|---------|
| `→` | Sequence | `A→B→C` |
| `⇒` | Mapping | `L⟨a,b,c⟩⇒λ⟨x⟩⟨x²⟩` |
| `[...×n]` | Repetition | `[C→P×3]` (repeat 3 times) |
| `(condition)\|expr` | Conditional | `(x>0)\|A→B` |
| `⊳` | Injection | `f⊳g` (f into g) |
| `⟿` | Optimization | `L⟿BCE` (optimize with BCE loss) |

### 3.2 Function Operations

| Symbol | Operation | Example |
|--------|-----------|---------|
| `λ⟨params⟩⟨body⟩` | Function def | `λ⟨x,y⟩⟨x+y⟩` |
| `f(x)` | Function call | `sqrt(⋱⌗)` |
| `f∘g` | Composition | `f∘g(x)` (f(g(x))) |
| `∇f` | Gradient | `∇f(x,y)` |
| `∫f` | Integration | `∫f(x)dx` |

## 4. Numeric Encoding

### 4.1 Basic Numerals

| Symbol | Value | Symbol | Value |
|--------|-------|--------|-------|
| `⊹` | 0 | `⌗` | 6 |
| `⊿` | 1 | `⊥` | 7 |
| `⋮` | 2 | `⊢` | 8 |
| `⋰` | 3 | `⊧` | 9 |
| `⋱` | 4 | `⋈` | 10 |
| `⌓` | 5 | | |

### 4.2 Extended Numerals

| Symbol | Value | Symbol | Value |
|--------|-------|--------|-------|
| `≡` | 100 | `Ⅰ` | -1 |
| `≢` | 1000 | `Ⅱ` | -2 |
| `≋` | 10000 | `Ⅲ` | -3 |
| `⋕` | 100000 | `Ⅳ` | -4 |
| | | `Ⅴ` | -5 |

### 4.3 Decimal Notation

| Symbol | Value | Symbol | Value |
|--------|-------|--------|-------|
| `⊹ᴧ¹` | 0.1 | `⋮ᴧ¹` | 2.1 |
| `⊹ᴧ²` | 0.01 | `⋮ᴧ²` | 2.01 |
| `⊹ᴧ³` | 0.001 | `⋰ᴧ³` | 3.001 |

### 4.4 Special Numbers

| Symbol | Value | Symbol | Value |
|--------|-------|--------|-------|
| `⊿̇` | √1 | `⊿̈` | 1² |
| `⋮̇` | √2 | `⋮̈` | 2² |
| `⊿̂` | 2¹ | `⋮̃` | 2π |
| `⋮̂` | 2² | `⋰̃` | e |
| `⋰̂` | 2³ | `⋱̃` | φ (golden ratio) |

## 5. Neural Network Notation

### 5.1 Network Definition

| Symbol | Description | Example |
|--------|-------------|---------|
| `N` | Network declaration | `N I → C₁ → P → F → D₁ → S` |
| `I` | Input layer | `I` or `I 28×28×1` |
| `S` | Output softmax | `S` |

### 5.2 Layer Types

| Symbol | Layer Type | Example |
|--------|------------|---------|
| `C₁` | Convolution | `C₁ 32 3 ρ` (32 filters, 3×3, ReLU) |
| `P` | Pooling | `P 2` (2×2 pooling) |
| `F` | Flatten | `F` |
| `D₁` | Dense hidden | `D₁ 128 ρ` (128 neurons, ReLU) |
| `D₀` | Dense output | `D₀ 10` (10 outputs) |
| `B` | Batch norm | `B` |
| `R` | Recurrent | `R 64` (64 units) |
| `L` | LSTM | `L 128` (128 units) |
| `U` | Upsampling | `U 2×` (2× upsampling) |
| `E` | Embedding | `E 300` (300 dim embedding) |

### 5.3 Activation Functions

| Symbol | Activation | Full Name |
|--------|------------|-----------|
| `ρ` | ReLU | Rectified Linear Unit |
| `σ` | Sigmoid | Sigmoid |
| `τ` | Tanh | Hyperbolic tangent |
| `ς` | Softmax | Softmax |
| `⍺` | ELU | Exponential Linear Unit |
| `Λ` | Leaky ReLU | Leaky Rectified Linear Unit |

### 5.4 Neural Architectures

| Symbol | Architecture | Example |
|--------|--------------|---------|
| `G⊕D` | GAN | `N⟨G⊕D⟩` |
| `E⊕D` | Autoencoder | `N⟨E⊕D⟩` |
| `G⊳D⟿BCE` | GAN+Loss | GAN with BCE loss |
| `T⇀E` | Transformer | Transformer to embedding |

## 6. Word and Phrase Encodings

### 6.1 Common Words

| Code | Word | Code | Word |
|------|------|------|------|
| `w₀` | the | `w₁₀` | for |
| `w₁` | is | `w₁₁` | be |
| `w₂` | of | `w₁₂` | with |
| `w₃` | and | `w₁₃` | as |
| `w₄` | you | `w₁₄` | this |
| `w₅` | to | `w₁₅` | have |
| `w₆` | a | `w₁₆` | from |
| `w₇` | in | `w₁₇` | or |
| `w₈` | that | `w₁₈` | by |
| `w₉` | it | `w₁₉` | not |

### 6.2 Technical Terms

| Code | Word | Code | Word |
|------|------|------|------|
| `w₂₅` | code | `w₃₁` | system |
| `w₂₆` | add | `w₃₂` | type |
| `w₂₇` | file | `w₃₃` | value |
| `w₂₈` | function | `w₃₄` | object |
| `w₂₉` | data | `w₃₅` | class |
| `w₃₀` | module | `w₃₆` | input |

### 6.3 Common Phrases

| Code | Phrase |
|------|--------|
| `s₀` | The system is running |
| `s₁` | Please provide more information |
| `s₂` | Operation completed successfully |
| `s₃` | Error in processing request |
| `s₄` | Implementing the function |
| `s₁₁` | Processing complete |
| `s₁₂` | Loading configuration file |

## 7. Extended Examples

### 7.1 Complex Data Definition

```
D⟨O⟨
  name:T⟨John Doe⟩,
  age:N⟨⋰⌓⟩,
  skills:L⟨T⟨Python⟩,T⟨GaiaScript⟩,T⟨ML⟩⟩,
  active:B⟨1⟩,
  contact:O⟨
    email:T⟨john@example.com⟩,
    phone:T⟨+1-555-0123⟩
  ⟩
⟩⟩
```

### 7.2 Neural Network Definition

```
// CNN for image classification
N I 28×28×1 → C₁ 32 3 ρ → P 2 → C₁ 64 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 ς

// GAN architecture
N⟨G⊕D⟩
G: Z 100 → D₁ 256 ρ → D₁ 512 ρ → D₀ 784 τ
D: I 784 → D₁ 512 ρ → D₁ 256 ρ → D₀ 1 σ
L: G(Z)⊳D⟿BCE+λ‖∇D‖
```

### 7.3 Algorithm Description

```
R⟨λ⟨sort⟩⟨
  D⟨L⟨⋰,⊿,⋱,⋮⟩⟩→
  [∀i∈[0,n-2] ∀j∈[i+1,n-1] (L[i]>L[j])\|swap(L,i,j)]→
  R⟨L⟩
⟩⟩
```

### 7.4 Complex Query

```
Q⟨
  T⟨w₄ w₂₁ w₂₃ ML w₁₀ N⟨⋱⟩ w₂₅ domains?⟩⊗
  O⟨
    experience: L⟨CV,NLP,RL,GNN⟩,
    constraint: T⟨highly w₃₂-efficient⟩,
    format: T⟨ranked list⟩
  ⟩
⟩
```

### 7.5 Answer to Complex Query

```
R⟨L⟨
  O⟨domain:T⟨NLP⟩,reason:T⟨text w₃₂-efficiency⟩,score:N⟨⊧⋱⟩⟩,
  O⟨domain:T⟨CV⟩,reason:T⟨image compression⟩,score:N⟨⊧⊹⟩⟩,
  O⟨domain:T⟨GNN⟩,reason:T⟨graph algorithms⟩,score:N⟨⊢⋮⟩⟩,
  O⟨domain:T⟨RL⟩,reason:T⟨policy compression⟩,score:N⟨⊢⊹⟩⟩
⟩⟩
```