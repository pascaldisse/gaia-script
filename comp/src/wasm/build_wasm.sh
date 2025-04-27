#!/bin/bash

# Script to build GaiaUI WebAssembly module
echo "Building GaiaUI WebAssembly module..."

# Check if wat2wasm is installed
if ! command -v wat2wasm &> /dev/null; then
    echo "Error: wat2wasm not found. Please install WebAssembly Binary Toolkit (WABT)."
    echo "You can install it with: brew install wabt (on macOS) or npm install -g wabt"
    exit 1
fi

# Directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Input and output paths
WAT_FILE="$SCRIPT_DIR/gaiaui.wat"
WASM_FILE="$SCRIPT_DIR/../../web/gaiaui.wasm"

# Compile the WebAssembly module
echo "Compiling $WAT_FILE to $WASM_FILE..."
wat2wasm "$WAT_FILE" -o "$WASM_FILE"

if [ $? -eq 0 ]; then
    echo "Successfully compiled WebAssembly module!"
    echo "Output: $WASM_FILE"
    
    # Get file size
    WASM_SIZE=$(wc -c < "$WASM_FILE")
    echo "Size: $WASM_SIZE bytes"
    
    # Create optimized version if wasm-opt is available
    if command -v wasm-opt &> /dev/null; then
        echo "Optimizing with wasm-opt..."
        wasm-opt -Oz "$WASM_FILE" -o "$WASM_FILE.opt"
        
        if [ $? -eq 0 ]; then
            # Get optimized file size
            OPT_SIZE=$(wc -c < "$WASM_FILE.opt")
            echo "Optimized size: $OPT_SIZE bytes"
            
            # Replace original with optimized
            mv "$WASM_FILE.opt" "$WASM_FILE"
            echo "Replaced with optimized version"
        else
            echo "Warning: Optimization failed, using unoptimized version"
        fi
    else
        echo "Note: Install binaryen for smaller builds: npm install -g binaryen"
    fi
else
    echo "Error: WebAssembly compilation failed"
    exit 1
fi

echo "Done!"