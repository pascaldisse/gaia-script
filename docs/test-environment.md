# GaiaScript Testing Environment

This document outlines the testing environment for GaiaScript, optimized for AI-to-AI communication, evolutionary development, and UI interaction.

## Overview

The GaiaScript Testing Environment provides a comprehensive framework for:
- Parsing and executing GaiaScript code
- Automating tests with AI-driven mutation strategies
- Validating GaiaScript code across multiple targets
- Simulating UI interactions and capturing results
- Evolving GaiaScript code through genetic algorithms

## Architecture

```
┌──────────────────────────────────────┐
│         GaiaScript Test Runner       │
├──────────┬────────────┬──────────────┤
│  Parser  │ Interpreter│  UI Simulator │
├──────────┼────────────┼──────────────┤
│ Mutation │ Evolution  │ Error Handler │
└──────────┴────────────┴──────────────┘
```

## Components

### 1. Parser and Executor

The parser and executor are responsible for:
- Tokenizing GaiaScript symbols (e.g., `N`, `C₁`, `ρ`, `w₀`)
- Building an Abstract Syntax Tree (AST)
- Executing GaiaScript code on multiple targets (JavaScript, WebAssembly, LLVM)

Performance targets:
- <1ms latency for simple scripts
- <100ms for complex networks

### 2. AI-Driven Mutation

The mutation engine supports:
- **Parameter mutation**: Adjusting numeric values in networks
- **Layer mutation**: Adding/removing/changing network layers
- **Operator mutation**: Swapping operators and activations
- **Structure mutation**: Modifying the structure of components

### 3. Test Suite

The test suite validates:
- Syntax correctness (parsing all GaiaScript symbols)
- Semantic correctness (evaluating expressions)
- Neural network structure and operations
- UI component rendering and interactions

### 4. AI-Driven Test Execution

The AI test executor:
- Runs test suites and collects results
- Simulates user input for interactive components
- Reads console logs and UI output
- Captures rendered HTML/CSS for analysis
- Simulates clicks and other UI interactions
- Fixes errors through code mutation
- Recursively refines code until tests pass

### 5. UI Integration

UI testing capabilities:
- Render GaiaScript UI components to a web view
- Capture DOM structure and CSS properties
- Trigger click events on rendered elements
- Verify UI behavior and appearance

### 6. Logging

All logs are formatted in GaiaScript notation:
- Log: `D⟨O⟨type:T⟨log⟩,msg:T⟨s₂⟩⟩⟩`
- Error: `D⟨O⟨type:T⟨error⟩,msg:T⟨s₃⟩⟩⟩`
- UI log: `D⟨O⟨type:T⟨ui⟩,action:T⟨click⟩⟩⟩`

### 7. Evolution Pipeline

Code evolution through:
- Genetic algorithms with tournament selection
- Mutation and crossover operations
- Fitness evaluation based on test results

## Usage

### Running Tests

```bash
node test/run.js [options]
```

Options:
- `--target=[js|wasm|llvm|all]` - Target platform
- `--mutation=[true|false]` - Enable mutation
- `--evolution=[true|false]` - Enable evolution
- `--iterations=[number]` - Maximum evolution iterations
- `--ui=[true|false]` - Include UI tests

### Example Test Definition

Test files use GaiaScript notation:

```
R⟨λ⟨test⟩⟨
  D⟨O⟨name:T⟨parse_C₁⟩,
     input:T⟨N I → C₁ 32 3 ρ → S⟩,
     expect:B⟨1⟩⟩⟩
⟩⟩
```

### UI Test Example

```
D⟨O⟨type:T⟨ui_test⟩,
   element:T⟨button#run⟩,
   action:T⟨click⟩,
   expect:T⟨s₂⟩⟩⟩
```

## Implementation Details

The testing environment is built on:
- Node.js for test running and JavaScript execution
- Headless browsers (Puppeteer) for UI testing
- WebAssembly for high-performance execution
- Custom mutation and evolution algorithms

## Performance Goals

- Parsing: <1ms for simple scripts
- Execution: <100ms for complex networks
- UI checks: <10ms per element
- Evolution: Process 100+ generations per minute