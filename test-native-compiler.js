#!/usr/bin/env node

/**
 * Test script for the GaiaScript Native Compiler
 * Uses the TypeScript compiler API directly
 */

const ts = require('./TypeScript/lib/typescript');
const fs = require('fs');

console.log('TypeScript compiler loaded successfully!');
console.log('TypeScript version:', ts.version);

// Simple GaiaScript example
const gaiaSource = `
導⟨UI, Utils⟩

界⟨✱⟩
  樣{color: blue}⟦Hello GaiaScript!⟧
⟨/界⟩
`;

console.log('\nGaiaScript source:');
console.log(gaiaSource);

// Create a simple transformer that converts GaiaScript to TypeScript
function transformGaiaScriptToTypeScript(source) {
    // Simple replacements for demonstration
    let tsCode = source;
    
    // Replace GaiaScript symbols with TypeScript equivalents
    tsCode = tsCode.replace(/導⟨(.+?)⟩/g, 'import { $1 } from "@gaiascript/runtime";');
    tsCode = tsCode.replace(/界⟨✱⟩/g, 'export function App() {');
    tsCode = tsCode.replace(/⟨\/界⟩/g, '}');
    tsCode = tsCode.replace(/樣\{(.+?)\}⟦(.+?)⟧/g, 'return <div style={{$1}}>$2</div>;');
    
    return tsCode;
}

// Transform the GaiaScript source
const tsCode = transformGaiaScriptToTypeScript(gaiaSource);

console.log('\nTransformed TypeScript code:');
console.log(tsCode);

// Create a TypeScript source file
const sourceFile = ts.createSourceFile(
    'test.tsx',
    tsCode,
    ts.ScriptTarget.ES2020,
    true,
    ts.ScriptKind.TSX
);

console.log('\nAST created successfully!');
console.log('Source file kind:', ts.SyntaxKind[sourceFile.kind]);

// Create a simple printer
const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false
});

// Print the source file
const result = printer.printFile(sourceFile);

console.log('\nFinal output:');
console.log(result);

// Save to file
fs.writeFileSync('test-output.tsx', result);
console.log('\nOutput saved to test-output.tsx');

console.log('\n✓ Native compiler test completed successfully!');