#!/bin/bash

# Create an HTML file that integrates our compiled GaiaScript with the AIBrowser

# Create the AIBrowser application page
cat > aibrowser-app.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GaiaScript AIBrowser</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    header {
      background-color: #4285f4;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    #console {
      background-color: #1e1e1e;
      color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      margin-top: 20px;
      min-height: 200px;
      max-height: 400px;
      overflow: auto;
    }
    .log-entry {
      margin: 5px 0;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <header>
    <h1>GaiaScript AIBrowser</h1>
    <div class="navbar">
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="gaia-playground.html">Playground</a></li>
        <li><a href="gaia-translator.html">Translator</a></li>
        <li><a href="gaia-demo.html">Demo</a></li>
      </ul>
    </div>
  </header>
  
  <div id="gaia-container"></div>
  
  <div id="console"></div>
  
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
  </script>
  
  <!-- GaiaScript Compiled Output -->
  <script src="gaia-compiled.js"></script>
</body>
</html>
EOF

# Try multiple ports until we find one that works
echo "Looking for an available port..."

# Create a simple server.js file
cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Try ports starting from this one
let startingPort = 8090;
const MAX_PORT = 8100;

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(false);
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// Find an available port
async function findAvailablePort() {
  let port = startingPort;
  while (port <= MAX_PORT) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  throw new Error('No available ports found');
}

// Start server with an available port
async function startServer() {
  try {
    const PORT = await findAvailablePort();
    
    const MIME_TYPES = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
    };
    
    const server = http.createServer((req, res) => {
      // Default to index.html for root request
      let url = req.url;
      if (url === '/') {
        url = '/index.html';
      }
      
      // Get file path
      const filePath = path.join(process.cwd(), url);
      const extname = path.extname(filePath).toLowerCase();
      
      // Set content type based on file extension
      const contentType = MIME_TYPES[extname] || 'application/octet-stream';
      
      // Read and serve the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end('Server error: ' + err.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });
    
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      // Write the port to a file so the bash script can read it
      fs.writeFileSync('port.txt', PORT.toString());
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
EOF

# Start the Node.js server
echo "Starting server..."
node server.js &
SERVER_PID=$!

# Wait a moment for the server to start and determine its port
sleep 2

# Check if the port file exists and read the port
if [ -f "port.txt" ]; then
  PORT=$(cat port.txt)
  echo "Server is running on port $PORT"
  
  echo "Browser app is running at http://localhost:$PORT/aibrowser-app.html"
  echo "GaiaScript Playground: http://localhost:$PORT/gaia-playground.html"
  echo "GaiaScript Translator: http://localhost:$PORT/gaia-translator.html"
  echo "Homepage: http://localhost:$PORT/index.html"
else
  echo "Failed to determine the server port. Please check if the server is running."
fi

echo "Press Ctrl+C to stop the server"

# Create the playground page
cat > gaia-playground.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GaiaScript Playground</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    header {
      background-color: #4285f4;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .editor-container {
      display: flex;
      height: 500px;
      margin-top: 20px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .editor-pane {
      flex: 1;
      background-color: #1e1e1e;
      color: #f0f0f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .output-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-left: 1px solid #ddd;
    }
    .button-row {
      padding: 10px;
      background-color: #252526;
      border-bottom: 1px solid #333;
      display: flex;
    }
    button {
      background-color: #4285f4;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
    }
    button:hover {
      background-color: #2a75f3;
    }
    .code-area {
      flex: 1;
      padding: 15px;
      font-family: 'Courier New', monospace;
      white-space: pre;
      overflow: auto;
      line-height: 1.5;
      font-size: 16px;
    }
    .output-header {
      padding: 10px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
      font-weight: bold;
    }
    .output-content {
      flex: 1;
      padding: 15px;
      overflow: auto;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    #console {
      background-color: #1e1e1e;
      color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      margin-top: 20px;
      height: 200px;
      overflow: auto;
    }
    .log-entry {
      margin: 5px 0;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <header>
    <h1>GaiaScript Playground</h1>
  </header>
  
  <div class="editor-container">
    <div class="editor-pane">
      <div class="button-row">
        <button id="run-btn">Run</button>
        <button id="save-btn">Save</button>
        <button id="clear-btn">Clear</button>
      </div>
      <div id="editor" class="code-area" contenteditable="true">N I → C₁ 32 → D₁ 10</div>
    </div>
    <div class="output-pane">
      <div class="output-header">
        Output
      </div>
      <div id="output" class="output-content"></div>
    </div>
  </div>
  
  <div id="console"></div>
  
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
    
    // Set up UI interactions
    document.addEventListener('DOMContentLoaded', function() {
      const editor = document.getElementById('editor');
      const output = document.getElementById('output');
      const runBtn = document.getElementById('run-btn');
      const saveBtn = document.getElementById('save-btn');
      const clearBtn = document.getElementById('clear-btn');
      
      // Run button
      runBtn.addEventListener('click', function() {
        const code = editor.textContent;
        console.log('Running GaiaScript code:', code);
        
        output.innerHTML = '';
        output.innerHTML += '<div class="output-line">Running GaiaScript...</div>';
        
        try {
          // Create a script element to execute the compiled code
          const scriptElement = document.createElement('script');
          scriptElement.src = 'gaia-compiled.js';
          scriptElement.onload = function() {
            output.innerHTML += '<div class="output-line success">Execution completed!</div>';
          };
          scriptElement.onerror = function() {
            output.innerHTML += '<div class="output-line error">Error loading script</div>';
          };
          document.body.appendChild(scriptElement);
        } catch (error) {
          output.innerHTML += `<div class="output-line error">Error: ${error.message}</div>`;
          console.error('Error running GaiaScript:', error);
        }
      });
      
      // Save button
      saveBtn.addEventListener('click', function() {
        const code = editor.textContent;
        const blob = new Blob([code], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'program.gaia';
        a.click();
        console.log('Code saved to program.gaia');
      });
      
      // Clear button
      clearBtn.addEventListener('click', function() {
        if (confirm('Clear the editor content?')) {
          editor.textContent = '';
          console.log('Editor cleared');
        }
      });
    });
  </script>
  
  <!-- GaiaScript Runtime -->
  <script src="gaia-compiled.js"></script>
</body>
</html>
EOF

# Create the translator page
cat > gaia-translator.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GaiaScript Translator</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    header {
      background-color: #4285f4;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .translator-container {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 20px;
      margin-bottom: 30px;
    }
    .translator-pane {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .translator-controls {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 15px;
    }
    .translator-header {
      padding: 10px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
    }
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 14px;
    }
    .translator-textarea {
      width: 100%;
      min-height: 300px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      border: none;
      resize: none;
      font-size: 14px;
      line-height: 1.5;
      box-sizing: border-box;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #4285f4;
      color: white;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    button:hover {
      background-color: #3367d6;
    }
    .button-swap {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      padding: 0;
      background-color: #f5f5f5;
      color: #4285f4;
      border: 1px solid #4285f4;
    }
    .button-swap:hover {
      background-color: #e6e6e6;
    }
    .examples-section {
      margin-top: 40px;
    }
    .example-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .example-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background-color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .example-title {
      font-size: 18px;
      margin: 0 0 15px 0;
      color: #4285f4;
    }
    .example-content {
      margin-top: 15px;
    }
    .example-source, .example-result {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      font-size: 12px;
    }
    .example-result {
      margin-top: 10px;
      background-color: #e8f0fe;
    }
    #console {
      background-color: #1e1e1e;
      color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      margin-top: 20px;
      height: 200px;
      overflow: auto;
    }
    .log-entry {
      margin: 5px 0;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <header>
    <h1>GaiaScript Translator</h1>
  </header>
  
  <div class="translator-container">
    <div class="translator-pane">
      <div class="translator-header">
        <select id="source-language">
          <option value="auto">Auto Detect</option>
          <option value="natural">Natural Language</option>
          <option value="gaiascript">GaiaScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <textarea id="source-text" class="translator-textarea" placeholder="Enter text to translate..."></textarea>
    </div>
    
    <div class="translator-controls">
      <button id="translate-btn">Translate →</button>
      <button id="swap-btn" class="button-swap">⇄</button>
    </div>
    
    <div class="translator-pane">
      <div class="translator-header">
        <select id="target-language">
          <option value="gaiascript">GaiaScript</option>
          <option value="natural">Natural Language</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      <textarea id="target-text" class="translator-textarea" placeholder="Translation will appear here..." readonly></textarea>
    </div>
  </div>
  
  <div class="examples-section">
    <h2>Translation Examples</h2>
    <div class="example-cards">
      <div class="example-card">
        <h3 class="example-title">Natural Language → GaiaScript</h3>
        <div class="example-content">
          <p>Input:</p>
          <div class="example-source">Create a neural network with an input layer, convolutional layer with 32 filters and ReLU activation, followed by pooling and a dense layer with 10 outputs</div>
          <p>Output:</p>
          <div class="example-result">N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S</div>
        </div>
      </div>
      
      <div class="example-card">
        <h3 class="example-title">GaiaScript → JavaScript</h3>
        <div class="example-content">
          <p>Input:</p>
          <div class="example-source">N〈G⊕D〉 
G: Z 100 → D₁ 256 ρ → D₀ 784 τ</div>
          <p>Output:</p>
          <div class="example-result">const model = tf.sequential();
model.add(tf.layers.dense({units: 256, activation: 'relu', inputShape: [100]}));
model.add(tf.layers.dense({units: 784, activation: 'tanh'}));</div>
        </div>
      </div>
      
      <div class="example-card">
        <h3 class="example-title">JavaScript → GaiaScript</h3>
        <div class="example-content">
          <p>Input:</p>
          <div class="example-source">const generator = tf.sequential();
generator.add(tf.layers.dense({units: 256, inputShape: [100]}));
generator.add(tf.layers.leakyReLU());
generator.add(tf.layers.dense({units: 512}));
generator.add(tf.layers.leakyReLU());
generator.add(tf.layers.dense({units: 784, activation: 'tanh'}));</div>
          <p>Output:</p>
          <div class="example-result">N〈G〉
G: Z 100 → D₁ 256 → LR → D₁ 512 → LR → D₀ 784 τ</div>
        </div>
      </div>
    </div>
  </div>
  
  <div id="console"></div>
  
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
    
    // Set up translation functionality
    document.addEventListener('DOMContentLoaded', function() {
      const sourceText = document.getElementById('source-text');
      const targetText = document.getElementById('target-text');
      const sourceLanguage = document.getElementById('source-language');
      const targetLanguage = document.getElementById('target-language');
      const translateBtn = document.getElementById('translate-btn');
      const swapBtn = document.getElementById('swap-btn');
      
      // Sample translations for examples
      const translations = {
        'natural-gaiascript': {
          'Create a neural network with an input layer, convolutional layer with 32 filters and ReLU activation, followed by pooling and a dense layer with 10 outputs': 
            'N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S',
          'Make a generative model that takes latent vectors of size 100 and outputs images of size 28x28': 
            'N〈G〉\nG: Z 100 → D₁ 256 ρ → D₁ 512 ρ → D₀ 784 τ'
        },
        'gaiascript-javascript': {
          'N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S': 
            `const model = tf.sequential();
model.add(tf.layers.conv2d({
  filters: 32, 
  kernelSize: 3, 
  activation: 'relu',
  inputShape: [28, 28, 1]
}));
model.add(tf.layers.maxPooling2d({poolSize: 2}));
model.add(tf.layers.flatten());
model.add(tf.layers.dense({units: 128, activation: 'relu'}));
model.add(tf.layers.dense({units: 10, activation: 'softmax'}));`,
          'N〈G⊕D〉 \nG: Z 100 → D₁ 256 ρ → D₀ 784 τ': 
            `const model = tf.sequential();
model.add(tf.layers.dense({units: 256, activation: 'relu', inputShape: [100]}));
model.add(tf.layers.dense({units: 784, activation: 'tanh'}));`
        },
        'gaiascript-python': {
          'N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S': 
            `import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])`
        }
      };
      
      // Translation functionality
      translateBtn.addEventListener('click', function() {
        const source = sourceText.value;
        const fromLang = sourceLanguage.value;
        const toLang = targetLanguage.value;
        
        if (!source) {
          console.warn('Please enter text to translate');
          return;
        }
        
        console.log(`Translating from ${fromLang} to ${toLang}...`);
        
        // Simulate translation delay
        targetText.value = 'Translating...';
        
        setTimeout(() => {
          // Simple lookup-based translation (in a real implementation, this would use AI)
          const translationKey = `${fromLang}-${toLang}`;
          
          if (translations[translationKey] && translations[translationKey][source]) {
            targetText.value = translations[translationKey][source];
          } else {
            // Generate a mock translation
            if (toLang === 'gaiascript') {
              targetText.value = 'N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S';
            } else if (toLang === 'javascript') {
              targetText.value = 'const model = tf.sequential();\nmodel.add(tf.layers.dense({units: 128, activation: "relu"}));\nmodel.add(tf.layers.dense({units: 10, activation: "softmax"}));';
            } else if (toLang === 'python') {
              targetText.value = 'import tensorflow as tf\n\nmodel = tf.keras.Sequential([\n    tf.keras.layers.Dense(128, activation="relu"),\n    tf.keras.layers.Dense(10, activation="softmax")\n])';
            } else {
              targetText.value = 'A neural network with an input layer, a hidden layer with 128 neurons and ReLU activation, and an output layer with 10 neurons and softmax activation.';
            }
          }
          
          console.log('Translation completed');
        }, 1000);
      });
      
      // Handle language swap
      swapBtn.addEventListener('click', function() {
        const tempLang = sourceLanguage.value;
        const tempText = sourceText.value;
        
        sourceLanguage.value = targetLanguage.value;
        sourceText.value = targetText.value;
        targetLanguage.value = tempLang;
        targetText.value = tempText;
        
        console.log('Languages swapped');
      });
      
      // Handle example cards
      document.querySelectorAll('.example-card').forEach(card => {
        card.addEventListener('click', function() {
          const exampleSource = this.querySelector('.example-source').textContent;
          const exampleResult = this.querySelector('.example-result').textContent;
          const titleText = this.querySelector('.example-title').textContent;
          
          // Set the appropriate languages based on the example title
          if (titleText.includes('Natural Language → GaiaScript')) {
            sourceLanguage.value = 'natural';
            targetLanguage.value = 'gaiascript';
          } else if (titleText.includes('GaiaScript → JavaScript')) {
            sourceLanguage.value = 'gaiascript';
            targetLanguage.value = 'javascript';
          } else if (titleText.includes('JavaScript → GaiaScript')) {
            sourceLanguage.value = 'javascript';
            targetLanguage.value = 'gaiascript';
          }
          
          // Set the source and target text
          sourceText.value = exampleSource;
          targetText.value = exampleResult;
          
          console.log(`Example loaded: ${titleText}`);
        });
      });
    });
  </script>
  
  <!-- GaiaScript Runtime -->
  <script src="gaia-compiled.js"></script>
</body>
</html>
EOF

# Create a simple index page for navigation
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GaiaScript Tools</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    header {
      background-color: #4285f4;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 32px;
    }
    .tools-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .tool-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .tool-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    }
    .tool-header {
      background-color: #1a73e8;
      color: white;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
    }
    .tool-content {
      padding: 20px;
    }
    .tool-description {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .tool-link {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4285f4;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    .tool-link:hover {
      background-color: #2a75f3;
    }
  </style>
</head>
<body>
  <header>
    <h1>GaiaScript Tools</h1>
  </header>
  
  <div class="tools-container">
    <div class="tool-card">
      <div class="tool-header">AIBrowser</div>
      <div class="tool-content">
        <div class="tool-description">
          An AI-powered browser interface that lets you interact with web content using GaiaScript neural networks.
        </div>
        <a href="aibrowser-app.html" class="tool-link">Launch AIBrowser</a>
      </div>
    </div>
    
    <div class="tool-card">
      <div class="tool-header">GaiaScript Playground</div>
      <div class="tool-content">
        <div class="tool-description">
          Write and test GaiaScript code in an interactive environment. Perfect for learning and experimentation.
        </div>
        <a href="gaia-playground.html" class="tool-link">Open Playground</a>
      </div>
    </div>
    
    <div class="tool-card">
      <div class="tool-header">GaiaScript Translator</div>
      <div class="tool-content">
        <div class="tool-description">
          Translate between natural language, GaiaScript, JavaScript, Python, and other programming languages.
        </div>
        <a href="gaia-translator.html" class="tool-link">Use Translator</a>
      </div>
    </div>
  </div>
  
  <script>
    console.log('GaiaScript Tools Index Page Loaded');
  </script>
</body>
</html>
EOF

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID; echo 'Server stopped'" INT
wait