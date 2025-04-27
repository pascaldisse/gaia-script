# GaiaScript Project Guidelines

## Build/Execution Commands
- Build GaiaScript compiler: `cd comp && node build.js`
- Run GaiaScript: `./gaia build main.gaia --output=build/output.js --target=web`
- Test examples: `cd test && node run.js test --file=examples/test-file.gaia`
- Run test suite: `cd test && node run.js test --suite=basic`
- Run all tests: `cd test && npm test`

## GaiaScript Language Requirements
- **Symbolic Syntax**: Use GaiaScript's symbolic notation for maximum efficiency
- **Compiler Location**: The GaiaScript compiler is located at `/Users/pascaldisse/gaia/.gaia/gaia/gaia`

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