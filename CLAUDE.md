# GaiaScript Project Guidelines

## Project Status (Updated: June 22, 2025)
- **Working Directory**: `/Users/pascaldisse/gaia/.gaia`
- **Git Branch**: update (up to date with origin/update)
- **Platform**: macOS (Darwin 24.0.0)
- **Compiler**: Universal compiler written in Rust (gaia-universal-compiler v0.1.0)
- **Build System**: Multiple compilation methods supported via restart.sh

## Build/Execution Commands
- **Primary Build**: `./restart.sh` - Compiles main.gaia and starts web server on port 8081
- **Rust Compiler**: Located at `comp/` directory, uses Cargo build system
- **Web Server**: Python HTTP server serves docs at http://localhost:8081
- **Compiler Methods** (tried in order):
  1. Compiler wrapper (gaia_compiler_wrapper.js)
  2. Traditional compilation (comp/build.js)
  3. Rust GaiaScript compiler (gaiascript.bak/gaia/gaia)

## Current Implementation
- **Main Application**: `main.gaia` - Pure symbolic GaiaScript implementation
- **Web Interface**: Multiple HTML pages (main-app.html, gaia-app.html, gaia-playground.html)
- **Runtime Files**: 
  - `docs/web/js/gaia-runtime.js` - Main runtime
  - `docs/web/js/chat-runtime.js` - Chat-specific runtime
- **Build Output**: `build/gaia-compiled.js`

## GaiaScript Language Requirements
- **Symbolic Syntax**: Use GaiaScript's symbolic notation for maximum efficiency
- **Encoding System**: Extended with kanji, emoji, and base64 number encoding
- **Compiler Target**: Web (JavaScript output)

## Code Style Guidelines
- **Imports**: Use `N⟨UI, Utils, JsSystem⟩` namespace imports pattern
- **Formatting**: 
  - 2-space indentation, 80 chars line length
  - Follow existing file patterns for GaiaScript symbols
- **Naming**: 
  - camelCase for variables/functions
  - PascalCase for components/classes
  - UPPER_SNAKE_CASE for constants
- **State Declaration**: Use `S⟨variable1: value1, variable2: value2⟩`
- **Functions**: Use `F⟨functionName, param1, param2⟩...⟨/F⟩` pattern
- **UI Components**: Declare with `UI⟨✱⟩...⟨/UI⟩` and proper styling
- **UI Styles**: Use `□{styles}⟦Content⟧` for styled elements
- **Variable Interpolation**: Use `${...}` for dynamic content
- **Error Handling**: Encapsulate error handling in dedicated GaiaScript functions

## Symbol Reference
- `N⟨...⟩` - Namespace imports
- `S⟨...⟩` - State declaration
- `F⟨...⟩...⟨/F⟩` - Function declaration
- `UI⟨✱⟩...⟨/UI⟩` - UI component declaration
- `□{...}` - Style block
- `⟦...⟧` - Content
- `${...}` - Variable interpolation

## Testing Guidelines
- Create test files in the `test/examples/` directory
- Follow the test file format in existing examples
- Use assertions in the format `expect:B⟨1⟩` for boolean tests
- Test parsers, runtime execution, and UI components separately

## GaiaScript Translation System

### Translation Capabilities
The GaiaScript Translator can convert between:
- Natural language (自然) ↔ GaiaScript (地本)
- JavaScript (鉤本) ↔ GaiaScript (地本)  
- Python (蛇本) ↔ GaiaScript (地本)
- GaiaScript (地本) → React (原子)

### Advanced Encoding System
The translation system uses several encoding approaches:

1. **Kanji Characters**: For concepts with direct East Asian language representations
   - "GaiaScript" → "地本" (Earth script)
   - "JavaScript" → "鉤本" (Hook script)
   - "Python" → "蛇本" (Snake script) 
   - "React" → "原子" (Atomic)

2. **Unicode Symbols**: For programming and abstract concepts
   - "function" → "λ" (Lambda)
   - "import" → "〓" (Import symbol)
   - "if" → "∇" (Condition)
   - "else" → "⊘" (Else branch)

3. **Emojis**: For intuitive representation of concepts
   - "web" → "🌐" (Internet)
   - "data" → "📊" (Data/statistics)
   - "Python" → "🐍" (Python)
   - "React" → "⚛️" (React/atomic)

4. **Shortened Chinese Forms**: Single characters for UI concepts
   - "container" → "器" (Container)
   - "button" → "鈕" (Button)
   - "translate" → "譯" (Translate)

5. **Custom Codes**: Alphanumeric codes with prefixes for terms without direct symbolic equivalents
   - Rust keywords: `r0` (fn), `r1` (let)
   - C++ keywords: `c0` (class), `c1` (public)
   - React terms: `re0` (Component), `re1` (render)
   - Common English words: `w0` (the), `w1` (be)

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

### Token Efficiency
- Each word or phrase is represented by a single token to minimize processing overhead
- The system achieves approximately 40% token reduction compared to standard code
- This results in more efficient AI processing and reduced computational costs

### Translation Tools
The system includes several key components:
- **Translation CLI**: Command-line tool for translation (`/Users/pascaldisse/gaia/.gaia/translate`)
- **Encoding Database**: CSV file mapping all encoded terms (`encoding.csv`)
- **Encoding Tools**: Utilities for encoding/decoding text
- **Web Interface**: Browser-based translation interface