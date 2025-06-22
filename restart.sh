#\!/bin/bash

echo "====== Gaia Main Restart Script ======"
date

echo "--------------------------------"
echo "Checking for running processes..."
pkill -f "node.*main.js" 2>/dev/null || true
pkill -f "cargo run" 2>/dev/null || true
pkill -f "gaiascript" 2>/dev/null || true
pkill -f "python3 -m http.server 8081" 2>/dev/null || true

# Kill any process using port 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Set up directory variables
GAIA_DIR="/Users/pascaldisse/gaia"
GAIA_DOT_DIR="$GAIA_DIR/.gaia"
BUILD_DIR="$GAIA_DOT_DIR/build"
WEB_JS_DIR="$GAIA_DOT_DIR/docs/web/js"
COMP_DIR="$GAIA_DOT_DIR/comp"

# Create directories if they don't exist
mkdir -p "$BUILD_DIR" "$WEB_JS_DIR"

echo "Compiling main.gaia to JavaScript..."

# Apply the compiler fix if it exists
if [ -f "$GAIA_DIR/fix_compiler.sh" ]; then
  echo "Applying compiler fix..."
  chmod +x "$GAIA_DIR/fix_compiler.sh"
  bash "$GAIA_DIR/fix_compiler.sh"
fi

# Attempt multiple compilation methods
COMPILE_STATUS=1

# Method 1: Try using the wrapper if available
if [ -f "$GAIA_DIR/gaia_compiler_wrapper.js" ]; then
  echo "Using compiler wrapper..."
  node "$GAIA_DIR/gaia_compiler_wrapper.js"
  COMPILE_STATUS=$?
  
  if [ $COMPILE_STATUS -eq 0 ]; then
    echo "Successfully compiled main.gaia using wrapper\!"
  else
    echo "Wrapper compilation failed, trying alternative methods..."
  fi
fi

# Method 2: Try traditional compilation if wrapper failed
if [ $COMPILE_STATUS -ne 0 ] && [ -d "$COMP_DIR" ]; then
  echo "Using traditional compilation..."
  cd "$COMP_DIR"
  if [ -f "build.js" ]; then
    node build.js "$GAIA_DOT_DIR/main.gaia" --output="$BUILD_DIR/gaia-compiled.js"
    COMPILE_STATUS=$?
    
    if [ $COMPILE_STATUS -eq 0 ]; then
      echo "Successfully compiled main.gaia using build.js\!"
    else
      echo "Traditional compilation failed, trying alternative methods..."
    fi
  else
    echo "build.js not found in $COMP_DIR"
  fi
  cd "$GAIA_DIR"
fi

# Method 3: Try the Rust gaia compiler if other methods failed
if [ $COMPILE_STATUS -ne 0 ]; then
  GAIA_COMPILER="$GAIA_DIR/gaiascript.bak/gaia/gaia"
  if [ -f "$GAIA_COMPILER" ]; then
    echo "Using Rust GaiaScript compiler..."
    "$GAIA_COMPILER" build "$GAIA_DOT_DIR/main.gaia" --output="$BUILD_DIR/gaia-compiled.js" --target=web
    COMPILE_STATUS=$?
    
    if [ $COMPILE_STATUS -eq 0 ]; then
      echo "Successfully compiled main.gaia using Rust compiler\!"
    else
      echo "All compilation methods failed\!"
    fi
  else
    echo "Rust GaiaScript compiler not found at $GAIA_COMPILER"
  fi
fi

if [ $COMPILE_STATUS -ne 0 ]; then
  echo "GaiaScript main.gaia compilation failed\! Exiting."
  exit 1
fi

# Copy compiled JS to web directory
COMPILED_JS="$BUILD_DIR/gaia-compiled.js"
RUNTIME_JS="$WEB_JS_DIR/gaia-runtime.js"

echo "Copying compiled JS to web directory..."
if [ -f "$COMPILED_JS" ]; then
  cp "$COMPILED_JS" "$RUNTIME_JS"
  echo "Successfully copied main.gaia compiled JS to web directory."
else
  echo "Warning: Compiled JS not found at $COMPILED_JS"
  echo "This should not happen since we checked compilation status earlier."
  exit 1
fi

# Ensure web assets are in place
echo "Ensuring web assets are in place..."
mkdir -p "$GAIA_DOT_DIR/docs/web/css"

# Create styles.css if missing
if [ \! -f "$GAIA_DOT_DIR/docs/web/css/styles.css" ]; then
  cat > "$GAIA_DOT_DIR/docs/web/css/styles.css" << 'STYLES'
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
STYLES
fi

# Create a simple HTML page for the main app
cat > "$GAIA_DOT_DIR/docs/web/main-app.html" << EOL
<\!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GaiaScript Main App</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        .app-container {
            margin-top: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
            padding: 20px;
            background-color: white;
        }
        
        .app-title {
            text-align: center;
            margin-bottom: 20px;
            color: #3f51b5;
        }
        
        .app-info {
            background-color: #f5f7fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #3f51b5;
        }
    </style>
</head>
<body>
    <header>
        <div class="navbar">
            <h1>GaiaScript System</h1>
            <ul class="nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="main-app.html" class="active">Main App</a></li>
                <li><a href="gaia-app.html">Chat App</a></li>
            </ul>
        </div>
    </header>
    
    <div class="container">
        <div class="app-container">
            <h2 class="app-title">GaiaScript Main Application</h2>
            
            <div class="app-info">
                <p>This is the main GaiaScript application.</p>
                <p>The main.gaia file is a symbolic mathematical language for minimizing token usage.</p>
            </div>
            
            <div id="gaia-container">
                <\!-- Main GaiaScript App will render here -->
            </div>
        </div>
        
        <div id="console" style="margin-top: 20px; background: #1e1e1e; color: #f0f0f0; padding: 10px; border-radius: 4px; min-height: 200px; overflow: auto; font-family: monospace;">
            <\!-- Console output -->
        </div>
    </div>
    
    <script>
        // Intercept console.log to display in our console element
        const consoleElement = document.getElementById('console');
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;
        
        console.log = function(...args) {
            originalConsoleLog.apply(console, args);
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.textContent = args.join(' ');
            consoleElement.appendChild(logEntry);
            consoleElement.scrollTop = consoleElement.scrollHeight;
        };
        
        console.warn = function(...args) {
            originalConsoleWarn.apply(console, args);
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.style.color = 'orange';
            logEntry.textContent = '⚠️ ' + args.join(' ');
            consoleElement.appendChild(logEntry);
            consoleElement.scrollTop = consoleElement.scrollHeight;
        };
        
        console.error = function(...args) {
            originalConsoleError.apply(console, args);
            
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.style.color = 'red';
            logEntry.textContent = '❌ ' + args.join(' ');
            consoleElement.appendChild(logEntry);
            consoleElement.scrollTop = consoleElement.scrollHeight;
        };
        
        console.log("GaiaScript Main App starting up...");
    </script>
    
    <\!-- Main GaiaScript Runtime -->
    <script src="js/gaia-runtime.js"></script>
</body>
</html>
EOL

# Start a simple HTTP server to serve the web files
echo "Starting web server..."
cd "$GAIA_DOT_DIR/docs/web"
python3 -m http.server 8081 &

# Wait for the server to start
sleep 1

# Open the app in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8081/main-app.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8081/main-app.html
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start http://localhost:8081/main-app.html
else
    echo "Please open http://localhost:8081/main-app.html in your browser"
fi

echo "GaiaScript main.gaia restarted successfully\!"
echo "Main App running at: http://localhost:8081/main-app.html"
