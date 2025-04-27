#!/bin/bash

# Kill any running Gaia processes
pkill -f "cargo run"
pkill -f "gaiascript"
pkill -f "node.*main.js"

# Kill any process using port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Clean and build the Rust components
cd "$(dirname "$0")"
cargo clean
cargo build --release

# Run with Rust compiler
cargo run --release -- ../main.gaia

echo "GaiaScript restarted successfully!"