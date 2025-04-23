/**
 * GaiaScript Compiler and Runtime
 * 
 * This file builds and processes GaiaScript code from main.gaia or a specified file.
 * It implements a JavaScript runtime for executing the symbolic language.
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let inputFile = 'main.gaia';
let outputFile = null;
let targetPlatform = 'web';
let noExecute = false;

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    // Handle options
    if (arg.startsWith('--output=')) {
      outputFile = arg.substring(9);
    } else if (arg.startsWith('--platform=')) {
      targetPlatform = arg.substring(11);
    } else if (arg === '--no-execute') {
      noExecute = true;
    }
  } else if (!arg.startsWith('-')) {
    // Handle input file
    inputFile = arg;
  }
}

// Resolve input file path
let inputPath;
if (path.isAbsolute(inputFile)) {
  inputPath = inputFile;
} else {
  inputPath = path.resolve(process.cwd(), inputFile);
}

// Resolve output file path
let outputPath;
if (outputFile) {
  if (path.isAbsolute(outputFile)) {
    outputPath = outputFile;
  } else {
    outputPath = path.resolve(process.cwd(), outputFile);
  }
} else {
  // Default output path
  const buildDir = path.join(process.cwd(), 'build');
  
  // Create build directory if it doesn't exist
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  outputPath = path.join(buildDir, 'gaia-compiled.js');
}

// Also create an HTML wrapper if target is web
let htmlOutputPath = null;
if (targetPlatform === 'web') {
  htmlOutputPath = outputPath.replace(/\.js$/, '.html');
  if (htmlOutputPath === outputPath) {
    htmlOutputPath = outputPath + '.html';
  }
}

// Read the GaiaScript file
if (!fs.existsSync(inputPath)) {
  console.error(`Error: Input file not found: ${inputPath}`);
  process.exit(1);
}

const gaiaCode = fs.readFileSync(inputPath, 'utf8');

// GaiaScript parser
function parseGaiaScript(code) {
  const ast = {
    type: 'Network',
    components: [],
    componentDefinitions: [],
    layers: []
  };
  
  // Parse the symbolic notation
  const lines = code.split('\n');
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }
    
    // Network definition
    if (line.match(/N\s*〈/)) {
      ast.type = 'Network';
      const components = line.match(/〈(.*?)〉/);
      if (components) {
        ast.components = components[1].split('⊕');
      }
    }
    // Component definition with colon
    else if (line.match(/^[A-Za-zα-ωΑ-Ω§γδμ∂ℝÞ¢Ħυη]:/)) {
      const component = {
        type: 'Component',
        id: line[0],
        body: line.substring(2)
      };
      ast.componentDefinitions.push(component);
    }
    // Component definition with symbol markers
    else if (line.match(/[A-Za-zα-ωΑ-Ω§γδμ∂ℝÞ¢Ħυη]⟪/)) {
      const match = line.match(/([A-Za-zα-ωΑ-Ω§γδμ∂ℝÞ¢Ħυη])⟪/);
      if (match) {
        const component = {
          type: 'Component',
          id: match[1],
          body: line
        };
        ast.componentDefinitions.push(component);
      }
    }
    // Layer definition
    else if (line.match(/[CDFPUGS][₀₁₂₃₄₅₆₇₈₉]*/)) {
      const layerMatch = line.match(/([CDFPUGS][₀₁₂₃₄₅₆₇₈₉]*)\s+(\d+)(?:\s+(\d+))?\s+([ρστ])?/);
      if (layerMatch) {
        const layer = {
          type: layerMatch[1],
          units: parseInt(layerMatch[2]),
          kernelSize: layerMatch[3] ? parseInt(layerMatch[3]) : null,
          activation: layerMatch[4] || null
        };
        ast.layers.push(layer);
      }
    }
  }
  
  return ast;
}

// Generate a title from the input file
function generateTitle(inputPath) {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  return baseName.charAt(0).toUpperCase() + baseName.slice(1) + ' - GaiaScript';
}

// GaiaScript compiler
function compileToJS(ast, inputPath) {
  let js = '';
  
  js += `// Generated from GaiaScript: ${path.basename(inputPath)}\n`;
  
  // Add environment detection
  js += `// Environment detection\n`;
  js += `const isNode = typeof window === 'undefined' && typeof process !== 'undefined';\n`;
  js += `const isBrowser = typeof window !== 'undefined';\n\n`;
  
  js += `const gaiaRuntime = {\n`;
  js += `  components: {},\n`;
  js += `  network: null,\n`;
  js += `  title: "${generateTitle(inputPath)}",\n`;
  js += `  initialize: function() {\n`;
  
  // Add component definitions
  const definedComponents = new Set();
  for (const component of ast.componentDefinitions) {
    js += `    this.components["${component.id}"] = function() {\n`;
    js += `      // Component ${component.id} implementation\n`;
    js += `      console.log("Running component ${component.id}");\n`;
    
    // Add specific component behavior based on the body
    if (component.body.includes('⌘"▶"⌘ω')) {
      js += `      // UI component with play button\n`;
      js += `      if (isBrowser) {\n`;
      js += `        const container = document.getElementById('gaia-container') || document.body;\n`;
      js += `        const button = document.createElement('button');\n`;
      js += `        button.textContent = '▶';\n`;
      js += `        button.className = 'gaia-button play-button';\n`;
      js += `        button.onclick = function() { console.log('Play clicked'); };\n`;
      js += `        container.appendChild(button);\n`;
      js += `      } else {\n`;
      js += `        console.log("[UI] Play button would be displayed in browser");\n`;
      js += `      }\n`;
    }
    
    if (component.body.includes('⌘"↺"⌘ω')) {
      js += `      // UI component with reset button\n`;
      js += `      if (isBrowser) {\n`;
      js += `        const container = document.getElementById('gaia-container') || document.body;\n`;
      js += `        const button = document.createElement('button');\n`;
      js += `        button.textContent = '↺';\n`;
      js += `        button.className = 'gaia-button reset-button';\n`;
      js += `        button.onclick = function() { console.log('Reset clicked'); };\n`;
      js += `        container.appendChild(button);\n`;
      js += `      } else {\n`;
      js += `        console.log("[UI] Reset button would be displayed in browser");\n`;
      js += `      }\n`;
    }
    
    js += `    };\n`;
    definedComponents.add(component.id);
  }
  
  // Add network components that weren't explicitly defined
  for (const component of ast.components) {
    if (!definedComponents.has(component)) {
      js += `    this.components["${component}"] = function() {\n`;
      js += `      // Default implementation for component ${component}\n`;
      js += `      console.log("Running default component ${component}");\n`;
      js += `    };\n`;
    }
  }
  
  // Create network function
  js += `    this.network = function() {\n`;
  js += `      // Main network logic\n`;
  js += `      console.log("GaiaScript network initialized");\n`;
  
  // Connect components with safety check to prevent errors
  for (const component of ast.components) {
    js += `      if (this.components["${component}"]) this.components["${component}"]();\n`;
    js += `      else console.warn("Component ${component} not found");\n`;
  }
  
  js += `    };\n`;
  js += `  },\n`;
  
  // Add UI initialization for web target
  if (targetPlatform === 'web') {
    js += `  initUI: function() {\n`;
    js += `    if (isBrowser) {\n`;
    js += `      // Set page title\n`;
    js += `      document.title = this.title;\n`;
    js += `      \n`;
    js += `      // Create container\n`;
    js += `      let container = document.getElementById('gaia-container');\n`;
    js += `      if (!container) {\n`;
    js += `        container = document.createElement('div');\n`;
    js += `        container.id = 'gaia-container';\n`;
    js += `        container.style.padding = '20px';\n`;
    js += `        container.style.margin = '10px';\n`;
    js += `        container.style.border = '1px solid #ccc';\n`;
    js += `        container.style.borderRadius = '8px';\n`;
    js += `        container.style.backgroundColor = '#f9f9f9';\n`;
    js += `        document.body.appendChild(container);\n`;
    js += `      }\n`;
    js += `      \n`;
    js += `      // Add styles\n`;
    js += `      const style = document.createElement('style');\n`;
    js += `      style.textContent = \`\n`;
    js += `        body { font-family: sans-serif; margin: 0; padding: 20px; }\n`;
    js += `        .gaia-button { \n`;
    js += `          padding: 8px 16px; \n`;
    js += `          margin: 4px; \n`;
    js += `          border: none; \n`;
    js += `          border-radius: 4px; \n`;
    js += `          cursor: pointer; \n`;
    js += `          font-size: 16px; \n`;
    js += `          color: white; \n`;
    js += `          background-color: #4285f4; \n`;
    js += `        }\n`;
    js += `        .gaia-button:hover { background-color: #2a75f3; }\n`;
    js += `        .play-button { background-color: #4caf50; }\n`;
    js += `        .play-button:hover { background-color: #45a049; }\n`;
    js += `        .reset-button { background-color: #f44336; }\n`;
    js += `        .reset-button:hover { background-color: #e53935; }\n`;
    js += `      \`;\n`;
    js += `      document.head.appendChild(style);\n`;
    js += `      \n`;
    js += `      console.log("UI initialized");\n`;
    js += `    } else {\n`;
    js += `      console.log("UI initialization skipped (not in browser)");\n`;
    js += `      console.log("Run in a browser to see the UI, or open the HTML file if generated");\n`;
    js += `    }\n`;
    js += `  },\n`;
  }
  
  js += `  run: function() {\n`;
  js += `    this.initialize();\n`;
  
  if (targetPlatform === 'web') {
    js += `    this.initUI();\n`;
  }
  
  js += `    if (this.network) {\n`;
  js += `      this.network.call(this);\n`;
  js += `    }\n`;
  js += `  }\n`;
  js += `};\n\n`;
  
  // Export for Node.js
  js += `// Export for Node.js\n`;
  js += `if (isNode) {\n`;
  js += `  module.exports = gaiaRuntime;\n`;
  js += `}\n\n`;
  
  // Add auto-run
  js += `// Run the GaiaScript program\n`;
  js += `gaiaRuntime.run();\n`;
  
  return js;
}

// Create HTML wrapper for web target
function createHtmlWrapper(jsPath, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
    <h1>${title}</h1>
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
  <script src="${path.basename(jsPath)}"></script>
</body>
</html>`;
}

// Process the GaiaScript code
try {
  console.log("Parsing GaiaScript...");
  const ast = parseGaiaScript(gaiaCode);
  
  console.log("Compiling to JavaScript...");
  const js = compileToJS(ast, inputPath);
  
  // Create output directory if needed
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write compiled JavaScript to output path
  fs.writeFileSync(outputPath, js, 'utf8');
  console.log(`GaiaScript compiled successfully to ${outputPath}`);
  
  // Create HTML wrapper for web target
  if (htmlOutputPath) {
    const html = createHtmlWrapper(outputPath, generateTitle(inputPath));
    fs.writeFileSync(htmlOutputPath, html, 'utf8');
    console.log(`HTML wrapper created at ${htmlOutputPath}`);
  }
  
  // Execute if not disabled
  if (!noExecute && targetPlatform !== 'web') {
    // For non-web targets, we can execute directly
    console.log("Executing compiled output...");
    require(outputPath);
  }
} catch (error) {
  console.error("Error during compilation:", error);
  process.exit(1);
}