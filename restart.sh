#!/bin/bash

# Kill any running Gaia processes
pkill -f "cargo run"
pkill -f "gaiascript"
pkill -f "node.*main.js"

# Kill any process using port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Copy main.gaia to build directory
echo "Copying main.gaia to build directory..."
cp "$(dirname "$0")/main.gaia" "$(dirname "$0")/build/"

# Clean and build the Rust components
cd "$(dirname "$0")/comp"
echo "Building Rust components..."
cargo clean
cargo build

# Build JavaScript components
cd ../build
echo "Compiling GaiaScript to JavaScript..."
node js/build.js --single-file

# Copy compiled JS to web directory
echo "Copying compiled JS to web directory..."
cp "$(dirname "$0")/build/gaia-compiled.js" "$(dirname "$0")/docs/web/js/gaia-runtime.js"

# Start a simple HTTP server to serve the web files
cd ../docs/web
echo "Starting web server..."
python3 -m http.server 8080 &

echo "GaiaScript restarted successfully!"
echo "Web interface available at: http://localhost:8080/"
echo "Running in single-file mode with consolidated components."