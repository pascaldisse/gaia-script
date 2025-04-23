# GaiaScript Cleanup Plan

## Core Files to Keep

### Primary Application
- `main.gaia` - The single, ultra-compact GaiaScript file containing the entire application

### Compiler and Runtime
- `src/` - Core compiler implementation
  - `aopl.pest` - Grammar definition (with our new symbols)
  - `ast.rs` - AST representation (with our extensions)
  - `compiler.rs` - Compiler implementation (with our extensions)
  - `interpreter.rs` - Runtime interpreter
  - `lib.rs` - Library exports
  - `main.rs` - CLI entry point
  - `parser.rs` - Parser implementation
  - `extensions/` - Our extensions for UI and 3D

### Documentation
- `README.md` - Main documentation
- `CLAUDE.md` - Project guidelines
- `API_REFERENCE.md` - API documentation

### Build System
- `Cargo.toml` - Rust project definition
- `Cargo.lock` - Dependency lock file

### Web Runtime
- `web/unified-app.html` - Single HTML file for running the app
- `web/js/gaia-unified.js` - Unified runtime JavaScript

## Files to Eliminate

### Redundant Example Files
- All files in `examples/` - Now superseded by main.gaia

### Obsolete JavaScript Files
- `game.js`
- `minimal.js`
- Redundant web JavaScript files that are now part of the unified runtime

### Obsolete HTML Files
- `standalone-gaia.html`
- Multiple HTML files in web/ that serve separate components

### Build Artifacts and Logs
- `server.log`, `server5555.log`, `server8080.log`
- `target/` directory (build artifacts)

## Implementation Strategy

1. First commit all the main.gaia changes
2. Create a new branch "cleanup-gaiascript"
3. Remove redundant files
4. Update build scripts and documentation
5. Create PR for the cleanup

## Future Considerations

- Further optimize the parser for our symbolic representation
- Make compiler directly output WebAssembly
- Consider a fully symbolic compiler representation