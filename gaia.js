#!/usr/bin/env node

/**
 * Gaia CLI - Command Line Interface for GaiaScript
 * 
 * A minimalist, efficient CLI tool for working with GaiaScript.
 * Uses the highly compressed .gaiapkg format for distribution.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const zlib = require('zlib');

// Constants for GaiaPkg format
const GAIAPKG_HEADER = 'Ğ⟨';
const GAIAPKG_FOOTER = '⟩Ğ';
const GAIAPKG_SECTION_SEPARATOR = '⊕';
const GAIAPKG_FILE_HEADER = 'ƒ⟨';
const GAIAPKG_FILE_FOOTER = '⟩ƒ';
const GAIAPKG_FILE_PATH_SEPARATOR = '⟨';
const GAIAPKG_FILE_CONTENT_SEPARATOR = '⟩⟨';

// Command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Word mapping for decompression (subset of the full mapping)
const WORD_MAPPING = {
  'w₂₈': 'function',
  'w₊₁': 'return',
  'w₊₂': 'const',
  'w₊₃': 'let',
  'w₊₄': 'var',
  'w₊₅': 'if',
  'w₊₆': 'else',
  'w₁₀': 'for',
  'w₊₇': 'while',
  'w₊₈': 'break',
  'w₊₉': 'continue',
  'w₋₁': 'switch',
  'w₋₂': 'case',
  'w₋₃': 'default',
  'w₋₄': 'try',
  'w₋₅': 'catch',
  'w₋₆': 'finally',
  'w₋₇': 'throw',
  'w₋₈': 'new',
  'w₁₄': 'this',
  'w₋₉': 'super',
  'w₃₅': 'class',
  'wₓ₁': 'extends',
  'wₓ₂': 'static',
  'wₓ₃': 'import',
  'wₓ₄': 'export',
  'w₁₆': 'from',
  'w₁₃': 'as',
  'wₓ₅': 'async',
  'wₓ₆': 'await',
  'wₓ₇': 'typeof',
  'wₓ₈': 'instanceof',
  'w₇': 'in',
  'w₂': 'of',
  'wₓ₉': 'delete',
  'w₆₄': 'void',
  'w₆₅': 'null',
  'w₆₆': 'undefined',
  'w₇₄': 'true',
  'w₇₅': 'false',
  'w₇₆': 'NaN',
  'w₇₇': 'Infinity',
  'w₇₈': 'console',
  'w₇₉': 'log',
  'w₈₀': 'error',
  'w₄₀': 'process',
  'w₃₀': 'module',
};

// Phrase mapping for decompression (subset of the full mapping)
const PHRASE_MAPPING = {
  's₍₁₎': 'function() {',
  's₍₂₎': 'return function() {',
  's₍₃₎': 'console.log(',
  's₍₄₎': 'if (',
  's₍₅₎': '} else {',
  's₍₆₎': 'for (let i = 0; i < ',
  's₍₁₁₎': 'module.exports = ',
  's₍₁₆₎': 'try {',
  's₍₁₇₎': '} catch (error) {',
};

/**
 * Decompress text using GaiaScript encodings
 * @param {string} text - Compressed text
 * @returns {string} Decompressed text
 */
function decompressText(text) {
  let decompressed = text;
  
  // Apply reverse word mappings
  for (const [encoding, word] of Object.entries(WORD_MAPPING)) {
    decompressed = decompressed.replace(new RegExp(encoding.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), word);
  }
  
  // Apply reverse phrase mappings
  for (const [encoding, phrase] of Object.entries(PHRASE_MAPPING)) {
    decompressed = decompressed.replace(new RegExp(encoding.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), phrase);
  }
  
  return decompressed;
}

/**
 * Decompress zlib compressed text
 * @param {string} text - Base64 encoded compressed text
 * @returns {string} Decompressed text
 */
function zlibDecompress(text) {
  const buffer = Buffer.from(text, 'base64');
  const decompressed = zlib.inflateSync(buffer);
  return decompressed.toString('utf-8');
}

/**
 * Extract the embedded GaiaPkg
 * @returns {string} Path to the extracted directory
 */
function extractEmbeddedPackage() {
  // Create temp directory
  const tmpDir = path.join(os.tmpdir(), `gaiascript-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  
  // Get embedded package
  const packageContent = getEmbeddedPackage();
  
  // Extract package
  extractPackageContent(packageContent, tmpDir);
  
  return tmpDir;
}

/**
 * Get the embedded GaiaPkg content
 * @returns {string} GaiaPkg content
 */
function getEmbeddedPackage() {
  // In a real implementation, this would be inlined directly in the script
  // For demonstration, we'll use an external file
  const packagePath = path.join(__dirname, 'gaiascript.gaiapkg');
  
  if (fs.existsSync(packagePath)) {
    return fs.readFileSync(packagePath, 'utf-8');
  } else {
    console.error('GaiaPkg file not found. Run "node gaiapkg.js gaia" first to create it.');
    process.exit(1);
  }
}

/**
 * Extract a GaiaPkg content
 * @param {string} packageContent - GaiaPkg content
 * @param {string} outputDir - Output directory
 */
function extractPackageContent(packageContent, outputDir) {
  // Check package format
  if (!packageContent.startsWith(GAIAPKG_HEADER) || !packageContent.endsWith(GAIAPKG_FOOTER)) {
    console.error('Invalid GaiaPkg format');
    process.exit(1);
  }
  
  // Extract package content
  const compressedContent = packageContent.substring(
    GAIAPKG_HEADER.length,
    packageContent.length - GAIAPKG_FOOTER.length
  );
  
  // Decompress zlib
  const decompressedZlib = zlibDecompress(compressedContent);
  
  // Decompress GaiaScript encoding
  const decompressed = decompressText(decompressedZlib);
  
  // Split sections
  const sections = decompressed.split(GAIAPKG_SECTION_SEPARATOR);
  
  // Process metadata
  const versionMatch = sections[0].match(/v⟨(.+?)⟩/);
  const timestampMatch = sections[1].match(/t⟨(.+?)⟩/);
  const fileCountMatch = sections[2].match(/f⟨(.+?)⟩/);
  
  if (!versionMatch || !timestampMatch || !fileCountMatch) {
    console.error('Invalid package metadata');
    process.exit(1);
  }
  
  // Process files
  for (let i = 3; i < sections.length; i++) {
    const section = sections[i];
    
    // Skip non-file sections
    if (!section.startsWith(GAIAPKG_FILE_HEADER) || !section.endsWith(GAIAPKG_FILE_FOOTER)) {
      continue;
    }
    
    // Extract file content
    const fileContent = section.substring(
      GAIAPKG_FILE_HEADER.length,
      section.length - GAIAPKG_FILE_FOOTER.length
    );
    
    // Split path and content
    const [filePath, compressedFileContent] = fileContent.split(GAIAPKG_FILE_PATH_SEPARATOR);
    
    // Decompress file content
    const decompressedFileContent = decompressText(compressedFileContent);
    
    // Calculate output path
    const outputPath = path.join(outputDir, filePath);
    
    // Create directory if needed
    const outputDirPath = path.dirname(outputPath);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(outputPath, decompressedFileContent);
  }
}

/**
 * Run the GaiaScript compiler
 * @param {string} inputFile - Input file
 * @param {Object} options - Compiler options
 */
function runCompiler(inputFile, options = {}) {
  // Extract package if needed
  const packageDir = extractEmbeddedPackage();
  
  // Find compiler script
  const compilerPath = path.join(packageDir, 'comp', 'build.js');
  
  if (!fs.existsSync(compilerPath)) {
    console.error('Compiler script not found in package');
    process.exit(1);
  }
  
  // Build command
  const args = [compilerPath];
  
  if (inputFile) {
    args.push(inputFile);
  }
  
  if (options.output) {
    args.push('--output', options.output);
  }
  
  if (options.target) {
    args.push('--target', options.target);
  }
  
  // Run compiler
  try {
    const result = execSync(`node ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    return result;
  } catch (error) {
    console.error(`Compiler error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Run the GaiaScript test framework
 * @param {string} testFile - Test file
 * @param {Object} options - Test options
 */
function runTests(testFile, options = {}) {
  // Extract package if needed
  const packageDir = extractEmbeddedPackage();
  
  // Find test runner
  const testRunnerPath = path.join(packageDir, 'test', 'run.js');
  
  if (!fs.existsSync(testRunnerPath)) {
    console.error('Test runner not found in package');
    process.exit(1);
  }
  
  // Build command
  const args = [testRunnerPath, 'test'];
  
  if (testFile) {
    args.push('--file', testFile);
  }
  
  if (options.target) {
    args.push('--target', options.target);
  }
  
  if (options.ui) {
    args.push('--ui', options.ui);
  }
  
  if (options.report) {
    args.push('--report', options.report);
  }
  
  // Run tests
  try {
    const result = execSync(`node ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    return result;
  } catch (error) {
    console.error(`Test error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Initialize a new GaiaScript project
 * @param {string} projectName - Project name
 */
function initProject(projectName) {
  // Create project directory
  const projectDir = path.join(process.cwd(), projectName);
  
  if (fs.existsSync(projectDir)) {
    console.error(`Directory already exists: ${projectDir}`);
    process.exit(1);
  }
  
  fs.mkdirSync(projectDir, { recursive: true });
  
  // Extract package
  const packageDir = extractEmbeddedPackage();
  
  // Create basic project structure
  const projectFiles = [
    {
      path: 'main.gaia',
      content: fs.readFileSync(path.join(packageDir, 'main.gaia'), 'utf-8')
    },
    {
      path: 'README.md',
      content: `# ${projectName}\n\nA GaiaScript project.\n\n## Usage\n\n\`\`\`\ngaia build\n\`\`\`\n`
    },
    {
      path: '.gitignore',
      content: 'node_modules\nbuild\n.DS_Store\n'
    }
  ];
  
  // Write project files
  for (const file of projectFiles) {
    fs.writeFileSync(path.join(projectDir, file.path), file.content);
  }
  
  console.log(`Created new GaiaScript project: ${projectName}`);
  console.log(`To get started:`);
  console.log(`  cd ${projectName}`);
  console.log(`  gaia build`);
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Gaia CLI - GaiaScript Command Line Interface

Usage:
  gaia <command> [options]

Commands:
  build [file]     Build GaiaScript file (defaults to main.gaia)
  test [file]      Run GaiaScript tests
  init <name>      Initialize a new GaiaScript project
  run [file]       Run GaiaScript file
  help             Show this help

Options:
  --target=<js|wasm|llvm>   Target platform for compilation
  --output=<path>           Output file path
  --ui=<true|false>         Include UI tests
  --report=<path>           Test report file path

Examples:
  gaia build main.gaia --target=js
  gaia test tests/basic.gaia
  gaia init my-gaia-project
  gaia run examples/counter.gaia
  `);
}

// Main function to handle commands
function main() {
  try {
    switch (command) {
      case 'build':
        const buildFile = args[1] || 'main.gaia';
        const buildOptions = parseOptions(args.slice(2));
        runCompiler(buildFile, buildOptions);
        break;
        
      case 'test':
        const testFile = args[1];
        const testOptions = parseOptions(args.slice(testFile ? 2 : 1));
        runTests(testFile, testOptions);
        break;
        
      case 'init':
        const projectName = args[1];
        if (!projectName) {
          console.error('Project name required');
          process.exit(1);
        }
        initProject(projectName);
        break;
        
      case 'run':
        const runFile = args[1] || 'main.gaia';
        const runOptions = parseOptions(args.slice(2));
        // Compile and then execute
        const outputPath = runOptions.output || path.join(process.cwd(), 'build', 'gaia-compiled.js');
        runCompiler(runFile, { ...runOptions, output: outputPath });
        execSync(`node ${outputPath}`, { stdio: 'inherit' });
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Parse command line options
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseOptions(args) {
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || 'true';
    }
  }
  
  return options;
}

// Run main function
main();