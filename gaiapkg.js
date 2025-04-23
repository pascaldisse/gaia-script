#!/usr/bin/env node

/**
 * GaiaPkg CLI Tool
 * 
 * Extracts and manages .gaiapkg files - a highly compressed format
 * for distributing GaiaScript applications and tooling.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

// Command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';
const packagePath = args[1];

// Constants
const GAIAPKG_HEADER = 'Ğ⟨';
const GAIAPKG_FOOTER = '⟩Ğ';
const GAIAPKG_SECTION_SEPARATOR = '⊕';
const GAIAPKG_FILE_HEADER = 'ƒ⟨';
const GAIAPKG_FILE_FOOTER = '⟩ƒ';
const GAIAPKG_FILE_PATH_SEPARATOR = '⟨';
const GAIAPKG_FILE_CONTENT_SEPARATOR = '⟩⟨';

/**
 * Word mapping for compression
 * Uses GaiaScript's word encodings to compress common words
 */
const WORD_MAPPING = {
  'function': 'w₂₈',
  'return': 'w₊₁',
  'const': 'w₊₂',
  'let': 'w₊₃',
  'var': 'w₊₄',
  'if': 'w₊₅',
  'else': 'w₊₆',
  'for': 'w₁₀',
  'while': 'w₊₇',
  'break': 'w₊₈',
  'continue': 'w₊₉',
  'switch': 'w₋₁',
  'case': 'w₋₂',
  'default': 'w₋₃',
  'try': 'w₋₄',
  'catch': 'w₋₅',
  'finally': 'w₋₆',
  'throw': 'w₋₇',
  'new': 'w₋₈',
  'this': 'w₁₄',
  'super': 'w₋₉',
  'class': 'w₃₅',
  'extends': 'wₓ₁',
  'static': 'wₓ₂',
  'import': 'wₓ₃',
  'export': 'wₓ₄',
  'from': 'w₁₆',
  'as': 'w₁₃',
  'async': 'wₓ₅',
  'await': 'wₓ₆',
  'typeof': 'wₓ₇',
  'instanceof': 'wₓ₈',
  'in': 'w₇',
  'of': 'w₂',
  'delete': 'wₓ₉',
  'void': 'w₆₄',
  'null': 'w₆₅',
  'undefined': 'w₆₆',
  'true': 'w₇₄',
  'false': 'w₇₅',
  'NaN': 'w₇₆',
  'Infinity': 'w₇₇',
  'console': 'w₇₈',
  'log': 'w₇₉',
  'error': 'w₈₀',
  'warning': 'w₈₁',
  'info': 'w₈₂',
  'debug': 'w₈₃',
  'document': 'w₈₄',
  'window': 'w₈₅',
  'global': 'w₈₆',
  'process': 'w₄₀',
  'require': 'w₈₇',
  'module': 'w₃₀',
  'exports': 'w₈₈',
  'prototype': 'w₈₉',
  'constructor': 'w₉₀',
  'length': 'w₉₁',
  'toString': 'w₉₂',
  'parseInt': 'w₉₃',
  'parseFloat': 'w₉₄',
  'Math': 'w₉₅',
  'Date': 'w₉₆',
  'Array': 'w₉₇',
  'Object': 'w₃₄',
  'String': 'w₉₈',
  'Number': 'w₉₉',
  'Boolean': 'w₁₀₀',
  'RegExp': 'w₁₀₁',
  'Map': 'w₁₀₂',
  'Set': 'w₁₀₃',
  'Promise': 'w₁₀₄',
  'Symbol': 'w₁₀₅',
  'Proxy': 'w₁₀₆',
  'Reflect': 'w₁₀₇',
  'JSON': 'w₁₀₈',
  'Error': 'w₁₀₉',
  'Buffer': 'w₁₁₀',
  'setInterval': 'w₁₁₁',
  'setTimeout': 'w₁₁₂',
  'clearInterval': 'w₁₁₃',
  'clearTimeout': 'w₁₁₄',
  'addEventListener': 'w₁₁₅',
  'removeEventListener': 'w₁₁₆',
  'createElement': 'w₁₁₇',
  'createTextNode': 'w₁₁₈',
  'querySelector': 'w₁₁₉',
  'querySelectorAll': 'w₁₂₀',
  'getElementById': 'w₁₂₁',
  'getElementsByClassName': 'w₁₂₂',
  'getElementsByTagName': 'w₁₂₃',
  'appendChild': 'w₁₂₄',
  'removeChild': 'w₁₂₅',
  'replaceChild': 'w₁₂₆',
  'insertBefore': 'w₁₂₇',
  'setAttribute': 'w₁₂₈',
  'getAttribute': 'w₁₂₉',
  'removeAttribute': 'w₁₃₀',
};

/**
 * Phrase mapping for compression
 * Uses GaiaScript's sentence fragment encodings to compress common code phrases
 */
const PHRASE_MAPPING = {
  'function() {': 's₍₁₎',
  'return function() {': 's₍₂₎',
  'console.log(': 's₍₃₎',
  'if (': 's₍₄₎',
  '} else {': 's₍₅₎',
  'for (let i = 0; i < ': 's₍₆₎',
  'for (let i = 0; i < array.length; i++) {': 's₍₇₎',
  'export default ': 's₍₈₎',
  'import { ': 's₍₉₎',
  '} from \'': 's₍₁₀₎',
  'module.exports = ': 's₍₁₁₎',
  'constructor() {': 's₍₁₂₎',
  'document.getElementById(\'': 's₍₁₃₎',
  'addEventListener(\'click\', ': 's₍₁₄₎',
  'new Promise((resolve, reject) => {': 's₍₁₅₎',
  'try {': 's₍₁₆₎',
  '} catch (error) {': 's₍₁₇₎',
  'const result = await ': 's₍₁₈₎',
  'export const ': 's₍₁₉₎',
  'export function ': 's₍₂₀₎',
  'return new Promise((resolve, reject) => {': 's₍₂₁₎',
  'Object.keys(': 's₍₂₂₎',
  'Object.values(': 's₍₂₃₎',
  'Object.entries(': 's₍₂₄₎',
  'Array.isArray(': 's₍₂₅₎',
  'JSON.parse(': 's₍₂₆₎',
  'JSON.stringify(': 's₍₂₇₎',
};

/**
 * Compress text using GaiaScript encodings
 * @param {string} text - Text to compress
 * @returns {string} Compressed text
 */
function compressText(text) {
  let compressed = text;
  
  // Apply phrase mappings first (to avoid partial word replacements)
  for (const [phrase, encoding] of Object.entries(PHRASE_MAPPING)) {
    compressed = compressed.replace(new RegExp(phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), encoding);
  }
  
  // Apply word mappings
  for (const [word, encoding] of Object.entries(WORD_MAPPING)) {
    // Use word boundary regex to avoid replacing parts of other words
    compressed = compressed.replace(new RegExp(`\\b${word}\\b`, 'g'), encoding);
  }
  
  return compressed;
}

/**
 * Decompress text using GaiaScript encodings
 * @param {string} text - Compressed text
 * @returns {string} Decompressed text
 */
function decompressText(text) {
  let decompressed = text;
  
  // Apply reverse word mappings
  for (const [word, encoding] of Object.entries(WORD_MAPPING)) {
    decompressed = decompressed.replace(new RegExp(encoding.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), word);
  }
  
  // Apply reverse phrase mappings
  for (const [phrase, encoding] of Object.entries(PHRASE_MAPPING)) {
    decompressed = decompressed.replace(new RegExp(encoding.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), phrase);
  }
  
  return decompressed;
}

/**
 * Further compress text using zlib
 * @param {string} text - Text to compress
 * @returns {string} Base64 encoded compressed text
 */
function zlibCompress(text) {
  const buffer = Buffer.from(text, 'utf-8');
  const compressed = zlib.deflateSync(buffer, { level: 9 });
  return compressed.toString('base64');
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
 * Create a GaiaPkg file
 * @param {string} outputPath - Output file path
 * @param {string[]} inputPaths - Array of paths to include
 */
function createPackage(outputPath, inputPaths) {
  const files = [];
  
  // Process each input path
  for (const inputPath of inputPaths) {
    if (fs.existsSync(inputPath)) {
      // Get file stats
      const stats = fs.statSync(inputPath);
      
      if (stats.isDirectory()) {
        // Process directory recursively
        const dirFiles = processDirectory(inputPath);
        files.push(...dirFiles);
      } else if (stats.isFile()) {
        // Process single file
        const fileInfo = processFile(inputPath);
        if (fileInfo) {
          files.push(fileInfo);
        }
      } else {
        console.warn(`Skipping unsupported path: ${inputPath}`);
      }
    } else {
      console.warn(`Path does not exist: ${inputPath}`);
    }
  }
  
  // Create package content
  const sections = [
    `v⟨1.0⟩`, // Version
    `t⟨${Date.now()}⟩`, // Timestamp
    `f⟨${files.length}⟩` // File count
  ];
  
  // Add file entries
  for (const file of files) {
    sections.push(file);
  }
  
  // Join sections with separator
  const content = sections.join(GAIAPKG_SECTION_SEPARATOR);
  
  // Apply GaiaScript compression
  const compressed = compressText(content);
  
  // Apply zlib compression
  const zlibCompressed = zlibCompress(compressed);
  
  // Create final package
  const packageContent = `${GAIAPKG_HEADER}${zlibCompressed}${GAIAPKG_FOOTER}`;
  
  // Write to file
  fs.writeFileSync(outputPath, packageContent);
  
  console.log(`Created package: ${outputPath}`);
  console.log(`Total files: ${files.length}`);
  console.log(`Raw size: ${content.length} bytes`);
  console.log(`GaiaScript compressed: ${compressed.length} bytes`);
  console.log(`Final package size: ${packageContent.length} bytes`);
  console.log(`Compression ratio: ${((1 - packageContent.length / content.length) * 100).toFixed(2)}%`);
}

/**
 * Process a directory recursively
 * @param {string} dirPath - Directory path
 * @param {string} basePath - Base path for relative paths
 * @returns {string[]} Array of processed file entries
 */
function processDirectory(dirPath, basePath = '') {
  const files = [];
  const entries = fs.readdirSync(dirPath);
  
  // Calculate relative base path if not provided
  if (!basePath) {
    basePath = path.dirname(dirPath);
  }
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectory
      const subDirFiles = processDirectory(fullPath, basePath);
      files.push(...subDirFiles);
    } else if (stats.isFile()) {
      // Process file
      const fileInfo = processFile(fullPath, basePath);
      if (fileInfo) {
        files.push(fileInfo);
      }
    }
  }
  
  return files;
}

/**
 * Process a single file
 * @param {string} filePath - File path
 * @param {string} basePath - Base path for relative paths
 * @returns {string} Processed file entry
 */
function processFile(filePath, basePath = '') {
  try {
    // Calculate relative path if base path provided
    const relativePath = basePath ? path.relative(basePath, filePath) : filePath;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip empty files
    if (!content.trim()) {
      return null;
    }
    
    // Compress file content
    const compressedContent = compressText(content);
    
    // Create file entry
    return `${GAIAPKG_FILE_HEADER}${relativePath}${GAIAPKG_FILE_PATH_SEPARATOR}${compressedContent}${GAIAPKG_FILE_FOOTER}`;
  } catch (error) {
    console.warn(`Error processing file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extract a GaiaPkg file
 * @param {string} packagePath - Package file path
 * @param {string} outputDir - Output directory
 */
function extractPackage(packagePath, outputDir) {
  if (!fs.existsSync(packagePath)) {
    console.error(`Package file not found: ${packagePath}`);
    process.exit(1);
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Read package file
  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  
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
  
  const version = versionMatch[1];
  const timestamp = new Date(parseInt(timestampMatch[1]));
  const fileCount = parseInt(fileCountMatch[1]);
  
  console.log(`Package version: ${version}`);
  console.log(`Package created: ${timestamp.toLocaleString()}`);
  console.log(`File count: ${fileCount}`);
  
  // Process files
  let extractedCount = 0;
  
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
    extractedCount++;
  }
  
  console.log(`Extracted ${extractedCount} files to: ${outputDir}`);
}

/**
 * List contents of a GaiaPkg file
 * @param {string} packagePath - Package file path
 */
function listPackage(packagePath) {
  if (!fs.existsSync(packagePath)) {
    console.error(`Package file not found: ${packagePath}`);
    process.exit(1);
  }
  
  // Read package file
  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  
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
  
  const version = versionMatch[1];
  const timestamp = new Date(parseInt(timestampMatch[1]));
  const fileCount = parseInt(fileCountMatch[1]);
  
  console.log('GaiaPkg Contents:');
  console.log(`-----------------`);
  console.log(`Version: ${version}`);
  console.log(`Created: ${timestamp.toLocaleString()}`);
  console.log(`File count: ${fileCount}`);
  console.log(`-----------------`);
  
  // List files
  let fileIndex = 1;
  
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
    
    // Calculate approximate size
    const rawSize = decompressText(compressedFileContent).length;
    const compressedSize = compressedFileContent.length;
    
    console.log(`${fileIndex}. ${filePath}`);
    console.log(`   Raw size: ${rawSize} bytes`);
    console.log(`   Compressed: ${compressedSize} bytes`);
    console.log(`   Ratio: ${((1 - compressedSize / rawSize) * 100).toFixed(2)}%`);
    
    fileIndex++;
  }
}

/**
 * Create a gaiapkg from essential GaiaScript components
 */
function createGaiaScriptPackage() {
  // Base directory
  const baseDir = path.resolve(process.cwd());
  
  // Essential components
  const components = [
    path.join(baseDir, 'main.gaia'),  // Main GaiaScript file
    path.join(baseDir, 'comp'),       // Compiler components
    path.join(baseDir, 'docs'),       // Documentation
    path.join(baseDir, 'test'),       // Testing framework
    path.join(baseDir, 'README.md'),  // Main README
    path.join(baseDir, 'CLAUDE.md'),  // Claude instructions
  ];
  
  // Output file
  const outputPath = path.join(baseDir, 'gaiascript.gaiapkg');
  
  // Create package
  createPackage(outputPath, components);
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
GaiaPkg - GaiaScript Package Manager

Usage:
  node gaiapkg.js <command> [options]

Commands:
  create <output>  Create a GaiaPkg file (includes files from current directory)
  extract <pkg> <dir>  Extract a GaiaPkg file to directory
  list <pkg>      List contents of a GaiaPkg file
  gaia            Create a complete GaiaScript package
  help            Show this help

Examples:
  node gaiapkg.js create myapp.gaiapkg
  node gaiapkg.js extract gaiascript.gaiapkg ./extracted
  node gaiapkg.js list gaiascript.gaiapkg
  node gaiapkg.js gaia

Note:
  GaiaPkg files use highly efficient compression techniques:
  1. GaiaScript word encodings (e.g., w₀, w₁, etc.)
  2. GaiaScript phrase encodings (e.g., s₀, s₁, etc.)
  3. zlib compression for maximum space efficiency
  `);
}

// Main function to handle commands
function main() {
  try {
    switch (command) {
      case 'create':
        if (!packagePath) {
          console.error('Output path required');
          process.exit(1);
        }
        createPackage(packagePath, [process.cwd()]);
        break;
        
      case 'extract':
        if (!packagePath) {
          console.error('Package path required');
          process.exit(1);
        }
        const outputDir = args[2] || './extracted';
        extractPackage(packagePath, outputDir);
        break;
        
      case 'list':
        if (!packagePath) {
          console.error('Package path required');
          process.exit(1);
        }
        listPackage(packagePath);
        break;
        
      case 'gaia':
        createGaiaScriptPackage();
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

// Run main function
main();