# GaiaScript macOS Native Compiler

This document explains how to use the GaiaScript macOS compiler, which allows you to compile GaiaScript code directly to native macOS applications using Swift, SwiftUI, and AppKit.

## Features

- Compile GaiaScript directly to Swift code
- Generate standalone macOS applications
- Access native Apple APIs and system features
- Create modern user interfaces with SwiftUI
- Integrate with Apple's development ecosystem
- Support for macOS system integration (notifications, menu bars, etc.)

## Requirements

- macOS 11.0 or later
- Xcode 13.0 or later with Command Line Tools installed
- Swift 5.5 or later

## Usage

### Basic Compilation

To compile a GaiaScript file to a macOS application:

```bash
cargo run -- macos <filename> <app_name> [output_dir]
```

For example:

```bash
cargo run -- macos docs/examples/macos_app.gaia MyCounterApp ./build
```

This will generate a macOS application project in the specified output directory (or the current directory if not specified).

### Building the Application

After generating the project, you can build it by:

1. Navigate to the project directory:
   ```bash
   cd build/MyCounterApp
   ```

2. Run the build script:
   ```bash
   ./build.sh
   ```

3. Run the application:
   ```bash
   open ./MyCounterApp
   ```

Alternatively, you can choose to build the application directly during compilation when prompted.

## Application Structure

The generated macOS application has the following structure:

- `main.swift` - The main Swift source code file
- `Info.plist` - Application configuration and metadata
- `build.sh` - Build script to compile the application
- `Sources/` - Additional source files directory

## Swift Integration

The macOS compiler translates GaiaScript components to their Swift/SwiftUI equivalents:

| GaiaScript         | Swift/SwiftUI             |
|--------------------|---------------------------|
| UI Component       | SwiftUI View              |
| State properties   | @State properties         |
| Events/Functions   | Swift functions           |
| Button             | SwiftUI Button            |
| Text/Label         | SwiftUI Text              |
| Input/TextField    | SwiftUI TextField         |
| Container/Div      | SwiftUI VStack/HStack     |
| Style properties   | SwiftUI modifiers         |

## Example

Here's a simple example of a GaiaScript counter application:

```
// GaiaScript example for macOS native compilation
// A simple counter application with SwiftUI interface

// UI Component
UI⟨ CounterApp
    // State properties
    count: 0,
    name: "GaiaScript Counter"
⟩
    // UI Structure 
    ⟨div style={backgroundColor: "#f0f0f0", padding: 20}
        ⟨text style={fontSize: 24, color: "#333", textAlign: "center"}⟩${name}⟨/text⟩
        
        ⟨div style={margin: "20px 0", padding: 20, backgroundColor: "#fff", borderRadius: 8}
            ⟨text style={fontSize: 40, textAlign: "center", margin: "10px 0"}⟩${count}⟨/text⟩
            
            ⟨div style={display: "flex", justifyContent: "center", margin: "20px 0"}
                ⟨button 
                    text="-" 
                    onClick={decrementCount}
                    style={
                        backgroundColor: "#336699", 
                        color: "#fff",
                        borderRadius: 25,
                        width: 50,
                        height: 50
                    }
                ⟩⟨/button⟩
                
                ⟨button 
                    text="+" 
                    onClick={incrementCount}
                    style={
                        backgroundColor: "#336699", 
                        color: "#fff",
                        borderRadius: 25,
                        width: 50,
                        height: 50
                    }
                ⟩⟨/button⟩
            ⟨/div⟩
            
            ⟨button 
                text="Reset" 
                onClick={resetCount}
                style={
                    backgroundColor: "#999",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "8px 16px"
                }
            ⟩⟨/button⟩
        ⟨/div⟩
    ⟨/div⟩
    
    // Event handlers
    function incrementCount() {
        count = count + 1;
    }
    
    function decrementCount() {
        if (count > 0) {
            count = count - 1;
        }
    }
    
    function resetCount() {
        count = 0;
    }
⟨/UI⟩
```

## Advanced Topics

### Accessing Native APIs

The macOS compiler includes access to common Apple frameworks:

- Foundation
- AppKit
- SwiftUI
- CoreGraphics
- CoreAnimation

### Custom Swift Code Integration

You can extend the generated Swift code by adding custom Swift files to the Sources directory after project generation.

### Building for Distribution

To build a distributable application:

1. Open the project directory in Xcode
2. Configure signing and capabilities
3. Archive the application for distribution

## Limitations

- Complex UI layouts may require adjustment
- Limited access to some low-level system features
- Some SwiftUI features from latest macOS versions may not be supported