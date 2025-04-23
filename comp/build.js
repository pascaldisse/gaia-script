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
if (inputFile === 'playground' || inputFile === 'translator' || inputFile === 'unified') {
  // Handle special modes for the interfaces
  targetPlatform = 'web';
  
  if (inputFile === 'unified') {
    inputPath = path.resolve(process.cwd(), 'docs/web', 'gaia-unified.html');
  } else {
    inputPath = path.resolve(process.cwd(), 'docs/web', `gaia-${inputFile}.html`);
  }
  
  // Create a temporary gaia file for this mode
  const tempGaiaPath = path.join(process.cwd(), 'build', `temp-${inputFile}.gaia`);
  fs.writeFileSync(tempGaiaPath, `N〈υ⊕η⊕Γ〉\nυ:I→UI→[Button,Panel,Input]→O\nη:I→D₁128ρ→D₀10σ\nΓ:G⊕D`);
  
  // Set input path to the temp file
  inputPath = tempGaiaPath;
} else if (path.isAbsolute(inputFile)) {
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
      js += `        button.onclick = function() { \n`;
      js += `          console.log('Play clicked'); \n`;
      js += `          // Create a simulation element\n`;
      js += `          const sim = document.createElement('div');\n`;
      js += `          sim.className = 'gaia-simulation';\n`;
      js += `          sim.style.width = '100%';\n`;
      js += `          sim.style.height = '200px';\n`;
      js += `          sim.style.backgroundColor = '#e0f7fa';\n`;
      js += `          sim.style.border = '1px solid #80deea';\n`;
      js += `          sim.style.borderRadius = '4px';\n`;
      js += `          sim.style.padding = '10px';\n`;
      js += `          sim.style.marginTop = '10px';\n`;
      js += `          sim.innerHTML = '<h3>GaiaScript Simulation</h3><p>Running simulation components...</p>';\n`;
      js += `          container.appendChild(sim);\n`;
      js += `        };\n`;
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
      js += `        button.onclick = function() { \n`;
      js += `          console.log('Reset clicked'); \n`;
      js += `          // Remove any simulation elements\n`;
      js += `          const sims = document.querySelectorAll('.gaia-simulation');\n`;
      js += `          for (const sim of sims) {\n`;
      js += `            sim.remove();\n`;
      js += `          }\n`;
      js += `        };\n`;
      js += `        container.appendChild(button);\n`;
      js += `      } else {\n`;
      js += `        console.log("[UI] Reset button would be displayed in browser");\n`;
      js += `      }\n`;
    }
    
    if (component.body.includes('⌘"⚙"⌘ω')) {
      js += `      // UI component with settings button\n`;
      js += `      if (isBrowser) {\n`;
      js += `        const container = document.getElementById('gaia-container') || document.body;\n`;
      js += `        const button = document.createElement('button');\n`;
      js += `        button.textContent = '⚙';\n`;
      js += `        button.className = 'gaia-button settings-button';\n`;
      js += `        button.style.backgroundColor = '#ff9800';\n`;
      js += `        button.onclick = function() { \n`;
      js += `          console.log('Settings clicked'); \n`;
      js += `          // Create a settings panel\n`;
      js += `          const panel = document.createElement('div');\n`;
      js += `          panel.className = 'gaia-settings';\n`;
      js += `          panel.style.width = '100%';\n`;
      js += `          panel.style.backgroundColor = '#fff3e0';\n`;
      js += `          panel.style.border = '1px solid #ffe0b2';\n`;
      js += `          panel.style.borderRadius = '4px';\n`;
      js += `          panel.style.padding = '15px';\n`;
      js += `          panel.style.marginTop = '10px';\n`;
      js += `          panel.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';\n`;
      js += `          \n`;
      js += `          // Add some settings controls\n`;
      js += `          panel.innerHTML = \`\n`;
      js += `            <h3>GaiaScript Settings</h3>\n`;
      js += `            <div style="margin-bottom: 10px;">\n`;
      js += `              <label style="display: block; margin-bottom: 5px;">Simulation Speed</label>\n`;
      js += `              <input type="range" min="1" max="10" value="5" style="width: 100%;">\n`;
      js += `            </div>\n`;
      js += `            <div style="margin-bottom: 10px;">\n`;
      js += `              <label style="display: block; margin-bottom: 5px;">Display Mode</label>\n`;
      js += `              <select style="width: 100%; padding: 5px;">\n`;
      js += `                <option>Standard</option>\n`;
      js += `                <option>Compact</option>\n`;
      js += `                <option>Advanced</option>\n`;
      js += `              </select>\n`;
      js += `            </div>\n`;
      js += `            <button style="padding: 5px 10px; background-color: #4285f4; color: white; border: none; border-radius: 4px;">Apply</button>\n`;
      js += `          \`;\n`;
      js += `          \n`;
      js += `          container.appendChild(panel);\n`;
      js += `          \n`;
      js += `          // Handle the Apply button click\n`;
      js += `          const applyBtn = panel.querySelector('button');\n`;
      js += `          applyBtn.onclick = function() {\n`;
      js += `            console.log('Settings applied');\n`;
      js += `            panel.remove();\n`;
      js += `          };\n`;
      js += `        };\n`;
      js += `        container.appendChild(button);\n`;
      js += `      } else {\n`;
      js += `        console.log("[UI] Settings button would be displayed in browser");\n`;
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
      
      // Add special behaviors for certain components
      if (component === "μ") {
        js += `      if (isBrowser) {\n`;
        js += `        // Create a visualization for the μ component\n`;
        js += `        const container = document.getElementById('gaia-container') || document.body;\n`;
        js += `        const visual = document.createElement('div');\n`;
        js += `        visual.className = 'gaia-component-visual';\n`;
        js += `        visual.style.margin = '10px 0';\n`;
        js += `        visual.style.padding = '15px';\n`;
        js += `        visual.style.backgroundColor = '#e8f5e9';\n`;
        js += `        visual.style.borderLeft = '5px solid #66bb6a';\n`;
        js += `        visual.style.borderRadius = '4px';\n`;
        js += `        visual.innerHTML = '<h3>Component μ (Mu)</h3><p>Handles transformation operations</p>';\n`;
        js += `        \n`;
        js += `        // Add a sample transformation visualization\n`;
        js += `        const canvas = document.createElement('canvas');\n`;
        js += `        canvas.width = 300;\n`;
        js += `        canvas.height = 100;\n`;
        js += `        canvas.style.display = 'block';\n`;
        js += `        canvas.style.marginTop = '10px';\n`;
        js += `        canvas.style.border = '1px solid #ccc';\n`;
        js += `        visual.appendChild(canvas);\n`;
        js += `        \n`;
        js += `        // Draw on the canvas\n`;
        js += `        const ctx = canvas.getContext('2d');\n`;
        js += `        ctx.fillStyle = '#f5f5f5';\n`;
        js += `        ctx.fillRect(0, 0, 300, 100);\n`;
        js += `        \n`;
        js += `        // Draw transformation diagram\n`;
        js += `        ctx.beginPath();\n`;
        js += `        ctx.moveTo(50, 50);\n`;
        js += `        ctx.lineTo(250, 50);\n`;
        js += `        ctx.strokeStyle = '#2196f3';\n`;
        js += `        ctx.lineWidth = 2;\n`;
        js += `        ctx.stroke();\n`;
        js += `        \n`;
        js += `        // Add arrow\n`;
        js += `        ctx.beginPath();\n`;
        js += `        ctx.moveTo(250, 50);\n`;
        js += `        ctx.lineTo(230, 40);\n`;
        js += `        ctx.lineTo(230, 60);\n`;
        js += `        ctx.closePath();\n`;
        js += `        ctx.fillStyle = '#2196f3';\n`;
        js += `        ctx.fill();\n`;
        js += `        \n`;
        js += `        // Add text\n`;
        js += `        ctx.font = '14px sans-serif';\n`;
        js += `        ctx.fillStyle = '#333';\n`;
        js += `        ctx.fillText('T', 35, 45);\n`;
        js += `        ctx.fillText('T\'', 260, 45);\n`;
        js += `        ctx.fillText('μ', 140, 40);\n`;
        js += `        \n`;
        js += `        container.appendChild(visual);\n`;
        js += `      }\n`;
      } else if (component === "∂") {
        js += `      if (isBrowser) {\n`;
        js += `        // Add a visual representation for the ∂ component\n`;
        js += `        const container = document.getElementById('gaia-container') || document.body;\n`;
        js += `        const visual = document.createElement('div');\n`;
        js += `        visual.className = 'gaia-component-visual';\n`;
        js += `        visual.style.margin = '10px 0';\n`;
        js += `        visual.style.padding = '15px';\n`;
        js += `        visual.style.backgroundColor = '#fff8e1';\n`;
        js += `        visual.style.borderLeft = '5px solid #ffd54f';\n`;
        js += `        visual.style.borderRadius = '4px';\n`;
        js += `        visual.innerHTML = '<h3>Component ∂ (Partial)</h3><p>Processing differential operations</p>';\n`;
        js += `        \n`;
        js += `        // Add a control set\n`;
        js += `        const controls = document.createElement('div');\n`;
        js += `        controls.style.marginTop = '10px';\n`;
        js += `        controls.innerHTML = \`\n`;
        js += `          <button class="gaia-button" style="background-color: #ffc107; margin-right: 5px;">Calculate</button>\n`;
        js += `          <span class="gaia-result" style="display: inline-block; padding: 5px 10px; background-color: #f5f5f5; border-radius: 4px;">Result: δ = 0</span>\n`;
        js += `        \`;\n`;
        js += `        \n`;
        js += `        // Add click handler\n`;
        js += `        const calcButton = controls.querySelector('button');\n`;
        js += `        const resultSpan = controls.querySelector('.gaia-result');\n`;
        js += `        let clickCount = 0;\n`;
        js += `        \n`;
        js += `        calcButton.onclick = function() {\n`;
        js += `          clickCount++;\n`;
        js += `          const result = Math.sin(clickCount / 3 * Math.PI).toFixed(4);\n`;
        js += `          resultSpan.textContent = 'Result: δ = ' + result;\n`;
        js += `          console.log('∂ calculation: ' + result);\n`;
        js += `        };\n`;
        js += `        \n`;
        js += `        visual.appendChild(controls);\n`;
        js += `        container.appendChild(visual);\n`;
        js += `      }\n`;
      }
      
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
  // Check if the input path includes special keywords for playground or translator
  const isPlayground = inputFile === 'playground';
  const isTranslator = inputFile === 'translator';
  const isSpecialMode = isPlayground || isTranslator;
  
  let additionalScripts = '';
  let additionalStyles = '';
  let additionalContent = '';
  
  if (isSpecialMode) {
    // Add the necessary scripts and styles for the special modes
    additionalScripts = `
  <!-- GaiaScript Runtime and Tools -->
  <script src="../docs/web/js/gaia-runtime.js"></script>
    `;
    
    if (isPlayground) {
      title = "GaiaScript Playground";
      additionalScripts += `
  <script>
    // Playground initialization
    document.addEventListener('DOMContentLoaded', function() {
      const editor = document.getElementById('editor');
      const output = document.getElementById('output');
      const runBtn = document.getElementById('run-btn');
      
      // Default GaiaScript code
      editor.textContent = 'N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S';
      
      // Run button event
      runBtn.addEventListener('click', function() {
        const code = editor.textContent;
        try {
          output.innerHTML = '<div>Running GaiaScript...</div>';
          const result = GaiaRuntime.run(code);
          output.innerHTML += '<div>Network initialized with ' + result.result.componentCount + ' components</div>';
          output.innerHTML += '<div>Compilation successful!</div>';
        } catch (error) {
          output.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
      });
    });
  </script>`;
      
      additionalStyles = `
    .editor-container {
      display: flex;
      flex-direction: row;
      gap: 20px;
      margin-bottom: 30px;
    }
    .editor-pane, .output-pane {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .button-row {
      padding: 10px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
    }
    #editor, #output {
      min-height: 300px;
      padding: 15px;
      font-family: monospace;
      overflow: auto;
    }
    #editor {
      background-color: #1e1e1e;
      color: #f0f0f0;
    }
    #output {
      background-color: #f9f9f9;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #4285f4;
      color: white;
    }
    button:hover {
      background-color: #3367d6;
    }
    .secondary {
      background-color: #f1f1f1;
      color: #333;
    }
    .error {
      color: red;
    }`;
      
      additionalContent = `
  <div class="editor-container">
    <div class="editor-pane">
      <div class="button-row">
        <button id="run-btn">Run</button>
        <button id="save-btn" class="secondary">Save</button>
      </div>
      <div id="editor" class="code-mirror-wrapper" contenteditable="true"></div>
    </div>
    <div class="output-pane">
      <div class="output-header">
        <h3>Output</h3>
      </div>
      <div id="output" class="output-content"></div>
    </div>
  </div>`;
    }
    
    if (isTranslator) {
      title = "GaiaScript Translator";
      additionalScripts += `
  <script src="../docs/web/js/gaia-translator.js"></script>`;
      
      additionalStyles = `
    .translator-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    .translator-pane {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .translator-header {
      padding: 10px;
      background-color: #f0f0f0;
      border-bottom: 1px solid #ddd;
    }
    .translator-textarea {
      width: 100%;
      min-height: 300px;
      padding: 15px;
      font-family: monospace;
      border: none;
      resize: none;
    }
    .translator-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #4285f4;
      color: white;
    }
    button:hover {
      background-color: #3367d6;
    }
    .examples-section {
      margin-top: 30px;
    }
    .example-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }
    .example-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background-color: #fff;
    }
    .example-content {
      font-size: 0.9rem;
      margin-top: 10px;
    }
    .example-result {
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
    }`;
      
      additionalContent = `
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
      <button id="swap-btn">⇄</button>
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
    <h3>Translation Examples</h3>
    <div class="example-cards">
      <div class="example-card">
        <h4>Natural Language → GaiaScript</h4>
        <div class="example-content">
          <p>Create a convolutional neural network with 32 filters and ReLU activation</p>
          <div class="example-result">N I → C₁ 32 3 ρ → P 2 → F → D₁ 128 ρ → D₀ 10 → S</div>
        </div>
      </div>
      <div class="example-card">
        <h4>GaiaScript → JavaScript</h4>
        <div class="example-content">
          <p>N〈G⊕D〉 G: Z 100 → D₁ 256 ρ → D₀ 784 τ</p>
          <div class="example-result">
            const model = tf.sequential();<br>
            model.add(tf.layers.dense({units: 256, activation: 'relu', inputShape: [100]}));<br>
            model.add(tf.layers.dense({units: 784, activation: 'tanh'}));
          </div>
        </div>
      </div>
    </div>
  </div>`;
    }
  }
  
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
    ${additionalStyles}
  </style>
  ${additionalScripts}
</head>
<body>
  <header>
    <h1>${title}</h1>
    <div class="navbar">
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="gaia-playground.html">Playground</a></li>
        <li><a href="gaia-translator.html">Translator</a></li>
        <li><a href="gaia-demo.html">Demo</a></li>
      </ul>
    </div>
  </header>
  
  ${additionalContent}
  
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
    
    // Open the HTML file in the default browser if requested
    if (args.includes('--open') || args.includes('-o')) {
      console.log('Opening HTML file in browser...');
      try {
        // Try different methods to open the browser
        let opened = false;
        try {
          // Try using the 'open' package
          const open = require('open');
          open(htmlOutputPath);
          opened = true;
        } catch (e) {
          // If 'open' package is not available, try other methods
          try {
            // Try 'opener' package
            const opener = require('opener');
            opener(htmlOutputPath);
            opened = true;
          } catch (e2) {
            // Try using child_process as fallback
            const { exec } = require('child_process');
            if (process.platform === 'darwin') {  // macOS
              exec(`open "${htmlOutputPath}"`);
            } else if (process.platform === 'win32') {  // Windows
              exec(`start "" "${htmlOutputPath}"`);
            } else {  // Linux
              exec(`xdg-open "${htmlOutputPath}"`);
            }
            opened = true;
          }
        }
        
        if (opened) {
          console.log(`Browser opened with ${htmlOutputPath}`);
        } else {
          console.log(`Could not open browser. Please open ${htmlOutputPath} manually.`);
        }
      } catch (error) {
        console.log(`Error opening browser: ${error.message}`);
        console.log(`Please open ${htmlOutputPath} manually in your browser.`);
      }
    }
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