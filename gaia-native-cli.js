#!/usr/bin/env node

/**
 * GaiaScript Native Compiler CLI
 * A command-line interface for the TypeScript-based GaiaScript compiler
 */

const { GaiaCompiler } = require('./build/compiler/index');
const fs = require('fs');
const path = require('path');

function showHelp() {
    console.log(`
GaiaScript Native Compiler

Usage: node gaia-native-cli.js [options] <input-file>

Options:
  -o, --output <file>    Output file (default: <input>.js)
  -d, --debug            Enable debug mode
  -h, --help             Show this help message

Example:
  node gaia-native-cli.js main.gaia
  node gaia-native-cli.js -o output.js -d main.gaia
`);
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }
    
    let inputFile = null;
    let outputFile = null;
    let debug = false;
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '-o' || arg === '--output') {
            outputFile = args[++i];
        } else if (arg === '-d' || arg === '--debug') {
            debug = true;
        } else if (!arg.startsWith('-')) {
            inputFile = arg;
        }
    }
    
    if (!inputFile) {
        console.error('Error: No input file specified');
        showHelp();
        process.exit(1);
    }
    
    // Default output file
    if (!outputFile) {
        outputFile = inputFile.replace(/\.gaia$/, '') + '.js';
    }
    
    try {
        // Read input file
        const source = fs.readFileSync(inputFile, 'utf8');
        console.log(`Compiling ${inputFile}...`);
        
        // Create compiler instance
        const compiler = new GaiaCompiler();
        
        // Compile with options
        const result = compiler.compile(source, {
            target: 'typescript',
            debug: debug
        });
        
        if (result.success) {
            // Write output
            fs.writeFileSync(outputFile, result.code);
            console.log(`✓ Compilation successful: ${outputFile}`);
            
            if (debug && result.diagnostics) {
                console.log('\nDiagnostics:');
                result.diagnostics.forEach(msg => console.log(`  ${msg}`));
            }
        } else {
            console.error('✗ Compilation failed');
            if (result.diagnostics) {
                result.diagnostics.forEach(msg => console.error(`  ${msg}`));
            }
            process.exit(1);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (debug) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the CLI
main();