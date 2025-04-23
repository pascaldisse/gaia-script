# GaiaScript Testing Environment

A comprehensive testing environment for GaiaScript, optimized for AI-to-AI communication, evolutionary development, and UI interaction. The environment is designed to support test-driven development (TDD), automated error correction, and AI-driven optimization.

## Features

- **Fast Parsing & Execution**: Parse and execute GaiaScript with high performance
- **AI-Driven Mutation**: Apply intelligent mutations to optimize GaiaScript code
- **UI Rendering & Interaction**: "See" and interact with rendered UI components
- **Evolutionary Optimization**: Use genetic algorithms to evolve optimal solutions
- **Comprehensive Testing**: Test parsing, execution, compilation, and UI interactions
- **GaiaScript Logging**: All logs and errors formatted in GaiaScript notation

## Installation

```bash
cd test
npm install
```

## Usage

### Running Tests

```bash
node run.js test --file=examples/basic-tests.gaia
```

### Parsing GaiaScript

```bash
node run.js parse --input="N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S"
```

### Compiling GaiaScript

```bash
node run.js compile --file=../main.gaia --target=js --output=output.js
```

### Executing GaiaScript

```bash
node run.js execute --file=../main.gaia
```

### Mutating GaiaScript

```bash
node run.js mutate --file=../main.gaia --rate=0.1 --output=mutated.gaia
```

### Evolving GaiaScript

```bash
node run.js evolve --file=../main.gaia --tests=examples/basic-tests.gaia --generations=20
```

### UI Testing

```bash
node run.js ui --file=../main.gaia --selector="button.play" --action=click
```

## Test File Format

Test files use GaiaScript notation:

```
R⟨λ⟨test⟩⟨
  D⟨O⟨name:T⟨parse_basic_network⟩,
     type:T⟨parser_test⟩,
     input:T⟨N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S⟩,
     expect:B⟨1⟩⟩⟩
⟩⟩
```

## Test Types

### Parser Tests

Test the parsing of GaiaScript notation:

```
D⟨O⟨name:T⟨parse_query⟩,
   type:T⟨parser_test⟩,
   input:T⟨Q⟨T⟨w₄ w₂₁ w₂₃ ML w₁₀ N⟨⋱⟩ w₂₅ domains?⟩⟩⟩,
   expect:B⟨1⟩⟩⟩
```

### Runtime Tests

Test the execution of GaiaScript code:

```
D⟨O⟨name:T⟨runtime_basic_calculation⟩,
   type:T⟨runtime_test⟩,
   input:T⟨R⟨λ⟨add⟩⟨N⟨⋮⟩+N⟨⋰⟩⟩⟩⟩,
   output:T⟨N⟨⋱⟩⟩,
   expect:B⟨1⟩⟩⟩
```

### Compiler Tests

Test the compilation of GaiaScript to different targets:

```
D⟨O⟨name:T⟨compile_network_to_js⟩,
   type:T⟨compiler_test⟩,
   input:T⟨N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S⟩,
   target:T⟨js⟩,
   expect:B⟨1⟩⟩⟩
```

### UI Tests

Test UI rendering and interaction:

```
D⟨O⟨name:T⟨ui_button_click⟩,
   type:T⟨ui_test⟩,
   input:T⟨υ〈§⊕γ⊕δ⊕α〉 γ:⟨{ϖ,ϖł,ϱ}⟩→∮⌗≡×⊧≡→П→⊞⋰×⋰→[(⌘"▶"⌘ω→φ.①),(⌘"↺"⌘ω→φ.⓪),(⌑"§"⇄φ.ς)]⟩,
   element:T⟨button.play⟩,
   action:T⟨click⟩,
   expect:T⟨s₂⟩⟩⟩
```

### Mutation Tests

Test code mutation strategies:

```
D⟨O⟨name:T⟨parameter_mutation⟩,
   type:T⟨mutation_test⟩,
   input:T⟨N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S⟩,
   mutation_type:T⟨parameter⟩,
   iterations:N⟨⊿⊹⟩,
   expect:B⟨1⟩⟩⟩
```

### Evolution Tests

Test evolutionary optimization:

```
D⟨O⟨name:T⟨cnn_evolution⟩,
   type:T⟨evolution_test⟩,
   input:T⟨N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S⟩,
   generations:N⟨⊿⊹⟩,
   population:N⟨⋮⊹⟩,
   fitness_target:N⟨⊹ᴧ⌗⟩,
   expect:B⟨1⟩⟩⟩
```

## Architecture

The testing environment consists of several components:

1. **GaiaParser**: Fast parser for GaiaScript notation with memoization
2. **GaiaInterpreter**: Executes GaiaScript code
3. **GaiaCompiler**: Compiles GaiaScript to various targets
4. **GaiaMutator**: Applies mutations to GaiaScript code
5. **GaiaUISimulator**: Renders and interacts with UI components
6. **GaiaTestRunner**: Runs tests and collects results
7. **GaiaEvolution**: Evolves GaiaScript code using genetic algorithms

## Performance Goals

- Parsing: <1ms for simple scripts
- Execution: <100ms for complex networks
- UI checks: <10ms per element
- Evolution: Process 100+ generations per minute