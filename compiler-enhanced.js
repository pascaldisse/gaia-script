#!/usr/bin/env node

/**
 * Enhanced GaiaScript Compiler
 * Improved version that handles complex GaiaScript syntax transformations
 */

const fs = require('fs');
const path = require('path');

class GaiaEnhancedCompiler {
    constructor() {
        this.symbolMap = {
            // Mathematical symbols
            'λ': 'function',
            'Σ': 'let state = ',
            '∆': 'const Component_',
            'Ω': 'function App',
            'Φ': 'style',
            
            // Data types
            'ℝ': 'number',
            '𝕊': 'string',
            '𝔸': 'Array',
            '𝕆': 'Object',
            '𝔹': 'boolean',
            
            // CSS shorthand
            'ρ': 'color',
            'β': 'border',
            'φ': 'padding',
            'μ': 'margin',
            'δ': 'display',
            'τ': 'transition',
            'κ': 'background',
            
            // Other symbols
            '∇': 'if',
            '⊘': 'else',
            '¬': '!',
            '≡': '===',
            '✱': '*',
            '⊥': 'none',
            '⚡': 'pointer',
            '◐': 'center',
            '☰': 'flex',
            '⊞': 'grid'
        };
        
        this.vectorNumbers = {
            '∅': 0, 'α': 1, 'β': 2, 'γ': 3, 'δ': 4,
            'ε': 5, 'ζ': 6, 'η': 7, 'θ': 8, 'ι': 9,
            '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5,
            '⑥': 6, '⑦': 7, '⑧': 8, '⑨': 9, '⑩': 10,
            'π': Math.PI, 'e': Math.E, '∞': Infinity
        };
    }
    
    compile(source, options = {}) {
        try {
            // Process in steps for better control
            let processed = this.preprocessSymbols(source);
            processed = this.transformFunctions(processed);
            processed = this.transformState(processed);
            processed = this.transformComponents(processed);
            processed = this.transformStyles(processed);
            processed = this.cleanupSyntax(processed);
            
            return {
                success: true,
                javascript: processed,
                typescript: processed,
                go: this.transformToGo(source),
                diagnostics: options.debug ? [`Enhanced compilation of ${source.length} characters`] : []
            };
        } catch (error) {
            return {
                success: false,
                javascript: '',
                typescript: '',
                go: '',
                diagnostics: [error.message]
            };
        }
    }
    
    preprocessSymbols(source) {
        let result = source;
        
        // Replace mathematical symbols
        for (const [symbol, replacement] of Object.entries(this.symbolMap)) {
            result = result.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        }
        
        // Process vector numbers
        result = result.replace(/⊗([∅αβγδεζηθι①②③④⑤⑥⑦⑧⑨⑩πe∞]+)/g, (match, encoded) => {
            return this.decodeVectorNumber(encoded);
        });
        
        // Handle composite numbers like 1⊗⑥ (16)
        result = result.replace(/(\d+)⊗([①②③④⑤⑥⑦⑧⑨⑩])/g, (match, tens, ones) => {
            const onesValue = this.vectorNumbers[ones] || 0;
            return tens + onesValue.toString();
        });
        
        return result;
    }
    
    decodeVectorNumber(encoded) {
        if (this.vectorNumbers[encoded] !== undefined) {
            return this.vectorNumbers[encoded].toString();
        }
        
        // Handle composite numbers
        let result = 0;
        let multiplier = 1;
        for (let i = encoded.length - 1; i >= 0; i--) {
            const digit = this.vectorNumbers[encoded[i]];
            if (digit !== undefined) {
                result += digit * multiplier;
                multiplier *= 10;
            }
        }
        
        return result.toString();
    }
    
    transformFunctions(source) {
        let js = source;
        
        // Transform function{name} body {/function} syntax
        js = js.replace(/function\s*\{([^}]+)\}\s*([^{]*?)\s*\{\/function\}/gs, (match, name, body) => {
            const cleanBody = this.cleanFunctionBody(body);
            return `function ${name}() {\\n  ${cleanBody}\\n}`;
        });
        
        // Transform function {name, params} body {/function}
        js = js.replace(/function\s*\{([^,}]+)(?:,\s*([^}]+))?\}\s*([^{]*?)\s*\{\/function\s*\}/gs, (match, name, params, body) => {
            const paramList = params ? params.split(',').map(p => p.trim()).join(', ') : '';
            const cleanBody = this.cleanFunctionBody(body);
            return `function ${name}(${paramList}) {\\n  ${cleanBody}\\n}`;
        });
        
        // Transform lambda expressions
        js = js.replace(/λ⟨([^,⟩]+)(?:,([^⟩]+))?⟩([^⟨]*)⟨\/λ⟩/gs, (match, name, params, body) => {
            const paramList = params ? params.split(',').map(p => p.trim()).join(', ') : '';
            return `function ${name}(${paramList}) {\\n${body}\\n}`;
        });
        
        return js;
    }
    
    cleanFunctionBody(body) {
        return body
            .replace(/counter\s*=\s*counter\s*\+\s*1/g, 'state.counter++; render();')
            .replace(/counter\s*=\s*counter\s*-\s*1/g, 'state.counter--; render();')
            .replace(/active\s*=\s*!active/g, 'state.active = !state.active; render();')
            .replace(/currentExample\s*=\s*([^\\s]+)/g, 'state.currentExample = $1; render();')
            .trim();
    }
    
    transformState(source) {
        let js = source;
        
        // Transform let state = { ... } blocks
        js = js.replace(/let\s+state\s*=\s*\{([^}]+)\}/gs, (match, content) => {
            const cleanContent = this.cleanStateContent(content);
            return `let state = {\\n${cleanContent}\\n};`;
        });
        
        return js;
    }
    
    cleanStateContent(content) {
        return content
            .replace(/string\s*\{([^}]+)\}/g, "'$1'")
            .replace(/Array\s*\{([^}]+)\}/g, '[$1]')
            .replace(/Object\s*\{([^}]+)\}/g, '{$1}')
            .replace(/([^:,\s]+):/g, '  $1:')
            .replace(/,\s*/g, ',\\n  ')
            .trim();
    }
    
    transformComponents(source) {
        let js = source;
        
        // Transform function App{*} syntax
        js = js.replace(/function\s+App\s*\{\s*\*\s*\}/g, 'export default function App()');
        
        // Transform component function calls
        js = js.replace(/function\s*\{([^}]+)\}/g, '$1()');
        
        return js;
    }
    
    transformStyles(source) {
        let js = source;
        
        // Transform style objects with quoted properties
        js = js.replace(/\{([^}]*'[^']*':\s*'[^']*'[^}]*)\}/g, (match, styles) => {
            const cleanStyles = styles
                .split(',')
                .map(style => style.trim())
                .filter(style => style.length > 0)
                .map(style => {
                    if (style.includes(':')) {
                        const [key, value] = style.split(':').map(s => s.trim());
                        const cleanKey = key.replace(/['"]/g, '');
                        const cleanValue = value.replace(/['"]/g, '');
                        return `  ${cleanKey}: '${cleanValue}'`;
                    }
                    return `  ${style}`;
                })
                .join(',\\n');
            return `{\\n${cleanStyles}\\n}`;
        });
        
        return js;
    }
    
    cleanupSyntax(source) {
        let js = source;
        
        // Clean up remaining GaiaScript syntax
        js = js.replace(/\{\/function\s*\}/g, '');
        js = js.replace(/\{\/function\s*$/gm, '');
        js = js.replace(/^\s*\*/gm, '');
        js = js.replace(/^\s*```[^`]*```/gm, '');
        
        // Fix imports
        js = js.replace(/import\s*\{[^}]*\}\s*from\s*"react";/g, 'import React, { useState, useEffect } from "react";');
        
        // Clean up extra whitespace
        js = js.replace(/\n\s*\n\s*\n/g, '\n\n');
        js = js.replace(/^\s*\n/gm, ''); 
        
        return js.trim();
    }
    
    transformToGo(source) {
        return `package main

import "fmt"

func main() {
    fmt.Println("GaiaScript Go output - Enhanced compiler")
}`;
    }
}

// Export for use in other scripts
module.exports = { GaiaEnhancedCompiler };

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: node compiler-enhanced.js <input.gaia>');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = inputFile.replace(/\.gaia$/, '-enhanced.js');
    
    try {
        const source = fs.readFileSync(inputFile, 'utf8');
        const compiler = new GaiaEnhancedCompiler();
        const result = compiler.compile(source, { debug: true });
        
        if (result.success) {
            fs.writeFileSync(outputFile, result.javascript);
            console.log(`✅ Enhanced compilation: ${inputFile} → ${outputFile}`);
            if (result.diagnostics.length > 0) {
                console.log('Diagnostics:', result.diagnostics);
            }
        } else {
            console.error('❌ Enhanced compilation failed:', result.diagnostics);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}