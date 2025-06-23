/**
 * GaiaScript Compiler - Main Entry Point
 * Orchestrates the compilation pipeline from GaiaScript to TypeScript/Go
 */

import { GaiaScanner } from "./scanner";
import { GaiaParser } from "./parser";
import { GaiaTransformer } from "./transformer";
import { GaiaEmitter, EmitResult } from "./emitter";

export interface CompileOptions {
    target?: 'typescript' | 'go' | 'javascript';
    outputPath?: string;
    debug?: boolean;
    sourceMap?: boolean;
}

export interface CompileResult extends EmitResult {
    success: boolean;
    diagnostics: string[];
}

export class GaiaCompiler {
    private scanner: GaiaScanner;
    private parser: GaiaParser;
    private transformer: GaiaTransformer;
    private emitter: GaiaEmitter;
    
    constructor() {
        this.transformer = new GaiaTransformer();
        this.emitter = new GaiaEmitter();
    }
    
    compile(source: string, options: CompileOptions = {}): CompileResult {
        const diagnostics: string[] = [];
        let success = true;
        
        try {
            // Phase 1: Lexical Analysis
            if (options.debug) {
                diagnostics.push("Phase 1: Lexical Analysis");
            }
            
            this.scanner = new GaiaScanner(source);
            const tokens = this.scanner.scan();
            
            if (options.debug) {
                diagnostics.push(`Tokenized ${tokens.length} tokens`);
            }
            
            // Phase 2: Parsing
            if (options.debug) {
                diagnostics.push("Phase 2: Parsing");
            }
            
            this.parser = new GaiaParser(source);
            const gaiaAST = this.parser.parse();
            
            if (options.debug) {
                diagnostics.push("Generated GaiaScript AST");
            }
            
            // Phase 3: Transformation
            if (options.debug) {
                diagnostics.push("Phase 3: Transformation");
            }
            
            const tsAST = this.transformer.transform(gaiaAST);
            
            if (options.debug) {
                diagnostics.push("Transformed to TypeScript AST");
            }
            
            // Phase 4: Emission
            if (options.debug) {
                diagnostics.push("Phase 4: Code Generation");
            }
            
            const emitResult = this.emitter.emit(tsAST, options.target);
            
            if (emitResult.errors.length > 0) {
                diagnostics.push(...emitResult.errors);
                success = false;
            }
            
            if (options.debug) {
                diagnostics.push(`Generated ${options.target || 'typescript'} code`);
            }
            
            return {
                ...emitResult,
                success,
                diagnostics
            };
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            diagnostics.push(`Compilation error: ${errorMessage}`);
            
            return {
                success: false,
                diagnostics,
                errors: [errorMessage]
            };
        }
    }
    
    compileToFile(source: string, outputPath: string, options: CompileOptions = {}): Promise<CompileResult> {
        return new Promise((resolve) => {
            const result = this.compile(source, options);
            
            if (result.success) {
                // In a real implementation, we'd write to file
                // For now, we'll just add the output path to diagnostics
                result.diagnostics.push(`Output would be written to: ${outputPath}`);
            }
            
            resolve(result);
        });
    }
    
    compileMultiple(sources: Record<string, string>, options: CompileOptions = {}): Record<string, CompileResult> {
        const results: Record<string, CompileResult> = {};
        
        for (const [filename, source] of Object.entries(sources)) {
            results[filename] = this.compile(source, options);
        }
        
        return results;
    }
    
    // Utility methods for CLI usage
    static version(): string {
        return "1.0.0";
    }
    
    static help(): string {
        return `
GaiaScript Compiler v${GaiaCompiler.version()}

Usage: gaia-compile [options] <input-file>

Options:
  --target <target>     Compilation target (typescript, go, javascript)
  --output <path>       Output file path
  --debug              Enable debug output
  --source-map         Generate source maps
  --help               Show this help message
  --version            Show version number

Examples:
  gaia-compile main.gaia
  gaia-compile --target go --output main.go main.gaia
  gaia-compile --debug --source-map app.gaia
        `.trim();
    }
}

// Export all compiler components
export { GaiaScanner, GaiaTokenKind, type GaiaToken } from "./scanner";
export { GaiaParser, type GaiaASTNode } from "./parser";
export { GaiaTransformer } from "./transformer";
export { GaiaEmitter, type EmitResult } from "./emitter";
export { encodingMap, expandChineseText, compressToChineseText } from "./encoding/character-map";

// Default export
export default GaiaCompiler;