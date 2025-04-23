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

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--')) {
    // Handle options
    if (arg.startsWith('--output=')) {
      outputFile = arg.substring(9);
    } else if (arg.startsWith('--platform=')) {
      targetPlatform = arg.substring(11);
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

// GaiaScript compiler
function compileToJS(ast) {
  let js = '';
  
  js += `// Generated from GaiaScript\n`;
  js += `const gaiaRuntime = {\n`;
  js += `  components: {},\n`;
  js += `  network: null,\n`;
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
      js += `      if (typeof document !== 'undefined') {\n`;
      js += `        const button = document.createElement('button');\n`;
      js += `        button.textContent = '▶';\n`;
      js += `        button.style.padding = '8px 16px';\n`;
      js += `        button.style.margin = '4px';\n`;
      js += `        button.onclick = function() { console.log('Play clicked'); };\n`;
      js += `        document.body.appendChild(button);\n`;
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
    js += `    if (typeof document !== 'undefined') {\n`;
    js += `      // Create container\n`;
    js += `      const container = document.getElementById('gaia-container');\n`;
    js += `      if (!container) {\n`;
    js += `        const newContainer = document.createElement('div');\n`;
    js += `        newContainer.id = 'gaia-container';\n`;
    js += `        newContainer.style.padding = '20px';\n`;
    js += `        newContainer.style.margin = '10px';\n`;
    js += `        newContainer.style.border = '1px solid #ccc';\n`;
    js += `        document.body.appendChild(newContainer);\n`;
    js += `      }\n`;
    js += `      console.log("UI initialized");\n`;
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
  
  // Create standalone HTML for web target
  if (targetPlatform === 'web') {
    js += `// Create HTML document if in browser context\n`;
    js += `if (typeof window !== 'undefined') {\n`;
    js += `  document.title = "GaiaScript Application";\n`;
    js += `  const style = document.createElement('style');\n`;
    js += `  style.textContent = 'body { font-family: sans-serif; }';\n`;
    js += `  document.head.appendChild(style);\n`;
    js += `}\n\n`;
  }
  
  js += `// Run the GaiaScript program\n`;
  js += `gaiaRuntime.run();\n`;
  
  // Export for Node.js
  js += `\n// Export for Node.js\n`;
  js += `if (typeof module !== 'undefined') {\n`;
  js += `  module.exports = gaiaRuntime;\n`;
  js += `}\n`;
  
  return js;
}

// Process the GaiaScript code
try {
  console.log("Parsing GaiaScript...");
  const ast = parseGaiaScript(gaiaCode);
  
  console.log("Compiling to JavaScript...");
  const js = compileToJS(ast);
  
  // Create output directory if needed
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write compiled JavaScript to output path
  fs.writeFileSync(outputPath, js, 'utf8');
  
  console.log(`GaiaScript compiled successfully to ${outputPath}`);
} catch (error) {
  console.error("Error during compilation:", error);
  process.exit(1);
}