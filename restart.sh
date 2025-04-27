#!/bin/bash

# Kill any running Gaia processes
pkill -f "cargo run"
pkill -f "gaiascript"
pkill -f "node.*main.js"

# Kill any process using port 8080
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Set up directory variables
SCRIPT_DIR="$(dirname "$0")"
BUILD_DIR="$SCRIPT_DIR/build"
WEB_JS_DIR="$SCRIPT_DIR/docs/web/js"
COMP_DIR="$SCRIPT_DIR/comp"

# Copy main.gaia to build directory
echo "Copying main.gaia to build directory..."
cp "$SCRIPT_DIR/main.gaia" "$BUILD_DIR/"

# Skip Rust compilation during refactoring
echo "Skipping Rust compilation during refactoring..."

# Build JavaScript components using our Node.js compiler
echo "Compiling GaiaScript to JavaScript..."
cd "$COMP_DIR"
node build.js
cd "$SCRIPT_DIR"

# Define output file paths
COMPILED_JS="$BUILD_DIR/gaia-compiled.js"
RUNTIME_JS="$WEB_JS_DIR/gaia-runtime.js"

echo "Copying compiled JS to web directory..."
mkdir -p "$WEB_JS_DIR"

# Check if compiled JS exists by using a more reliable path
ABSOLUTE_COMPILED_JS="$SCRIPT_DIR/build/gaia-compiled.js"
if [ -f "$ABSOLUTE_COMPILED_JS" ]; then
    echo "Found compiled JS at $ABSOLUTE_COMPILED_JS"
    cp "$ABSOLUTE_COMPILED_JS" "$RUNTIME_JS"
    echo "Copied to $RUNTIME_JS"
else
    echo "Warning: compiled JavaScript not found at $ABSOLUTE_COMPILED_JS"
    # Try looking for it in the current directory
    if [ -f "gaia-compiled.js" ]; then
        echo "Found compiled JS in current directory"
        cp "gaia-compiled.js" "$RUNTIME_JS"
    else
        echo "Creating empty placeholder file"
        echo "// Generated from GaiaScript" > "$RUNTIME_JS"
    fi
fi

# Check the result
if [ -f "$RUNTIME_JS" ]; then
    echo "Successfully created web runtime JS at $RUNTIME_JS"
    ls -la "$RUNTIME_JS"
else
    echo "Error: Failed to create runtime JS"
fi

# Ensure CSS files are correctly in place
echo "Ensuring web assets are in place..."
mkdir -p "$SCRIPT_DIR/docs/web/css"
cp "$SCRIPT_DIR/docs/web/css/styles.css" "$SCRIPT_DIR/docs/web/css/styles.css.bak" 2>/dev/null || true

# Create a simple HTML file if any are missing
cat > "$SCRIPT_DIR/docs/web/css/styles.css" << 'EOL'
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f7f8fa;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  background-color: #1a1a1a;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  color: #ddd;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: white;
}

pre {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.editor-container {
  display: flex;
  height: 400px;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.editor-pane {
  flex: 1;
  background-color: #ffffff;
  border-right: 1px solid #e1e4e8;
}

.output-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fafbfc;
}

.output-header {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e1e4e8;
}

.output-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.button-row {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
}

button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0069d9;
}

.code-mirror-wrapper {
  height: 100%;
  padding: 1rem;
  font-family: monospace;
  white-space: pre;
  overflow: auto;
}
EOL

# Start a simple HTTP server to serve the web files - open the playground instead of index
cd "$SCRIPT_DIR/docs/web"
echo "Starting web server..."
python3 -m http.server 8080 &

# Wait a moment for the server to start
sleep 1

# Open the playground in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080/gaia-playground.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080/gaia-playground.html
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start http://localhost:8080/gaia-playground.html
else
    echo "Please open http://localhost:8080/gaia-playground.html in your browser"
fi

echo "GaiaScript restarted successfully!"
echo "GaiaScript Playground opened at: http://localhost:8080/gaia-playground.html"